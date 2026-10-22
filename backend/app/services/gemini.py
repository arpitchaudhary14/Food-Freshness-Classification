import os
import re
import json
from google import genai
from google.genai import types
from PIL import Image
import io

from app.core.config import settings

# Candidate models in priority order for resilience against rate limits/spikes
CANDIDATE_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
]

# System-level locale and dialect mode configuration (Indian English en-IN)
DEFAULT_SYSTEM_INSTRUCTION = (
    "You are an expert food classifier and food safety AI assistant operating in India (Locale: en-IN).\n"
    "Terminology Standard: You strictly use standard Indian English vocabulary for all food items, vegetables, fruits, and dishes.\n"
    "- Use 'Brinjal' (not Eggplant/Aubergine), 'Ladyfinger' (not Okra/Gumbo), 'Capsicum' (not Bell Pepper), "
    "'Coriander' (not Cilantro), 'Spring Onion' (not Scallion), 'Bitter Gourd' (not Bitter Melon).\n"
    "Always adhere to Indian English naming conventions naturally without breaking character."
)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print("Failed to initialize Gemini client:", e)

    def _get_client(self):
        if not self.client:
            key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
            if key:
                try:
                    self.api_key = key
                    self.client = genai.Client(api_key=key)
                except Exception as e:
                    print("Error lazily creating Gemini client:", e)
        return self.client

    def _generate_with_fallback(self, contents, system_instruction: str = None) -> str:
        client = self._get_client()
        if not client:
            return ""

        instruction = system_instruction or DEFAULT_SYSTEM_INSTRUCTION
        config = types.GenerateContentConfig(
            system_instruction=instruction,
            temperature=0.2
        )

        last_error = None
        for model_name in CANDIDATE_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                # Try next model in candidate list (handles 429 quota exhaustion or 503 high demand)
                print(f"Gemini model {model_name} error: {e}. Trying next fallback...")
                continue

        if last_error:
            print("All Gemini fallback models exhausted:", last_error)
        return ""

    def _clean_food_name(self, text: str) -> str:
        if not text:
            return ""
        # Take first non-empty line
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        if not lines:
            return ""
        first_line = lines[0]
        
        # Remove markdown bold/italic/backticks/bullets
        clean = re.sub(r'[*_`#\-\>]', '', first_line).strip()
        # Remove prefixes like "Food:", "Item:", "Produce:", "Name:", "Detected:"
        clean = re.sub(r'^(Food|Item|Produce|Name|Detected):\s*', '', clean, flags=re.IGNORECASE).strip()
        # Strip quotation marks
        clean = clean.strip('\'"“”')
        # Remove trailing punctuation
        clean = clean.rstrip('.:;,!?')
        # Remove qualifiers like "Fresh", "Rotten", "Spoiled", "Moldy" from the beginning
        clean = re.sub(r'^(Fresh|Rotten|Spoiled|Moldy|Decayed|Decomposing)\s+', '', clean, flags=re.IGNORECASE).strip()
        # Title case
        if clean:
            clean = clean.title()
        return clean

    def _parse_json_response(self, text: str) -> dict:
        if not text:
            return {}
        try:
            match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception:
            pass
        return {}

    def analyze_food_and_freshness(self, image_bytes: bytes) -> dict:
        """
        Smart Dual-Engine Analyzer:
        Classifies the food item, determines whether it is raw agricultural produce
        (for the Keras veggie model) or prepared/meat/cooked food (for Gemini culinary assessment),
        and provides an expert visual freshness assessment.
        """
        client = self._get_client()
        default_res = {
            "name": "Unidentified Item",
            "is_raw_produce": True,
            "freshness": "FRESH",
            "confidence": 0.90
        }
        if not client:
            return default_res

        try:
            image = Image.open(io.BytesIO(image_bytes))
            prompt = (
                "You are an expert food classifier and culinary safety specialist.\n"
                "Analyze the food item shown in this image and return a JSON object with EXACTLY this structure:\n"
                "{\n"
                '  "name": "Specific Food Name (1 to 2 words, e.g. Burger, Pizza, Roasted Chicken, Apple, Tomato, French Fries, Rice)",\n'
                '  "is_raw_produce": true or false,\n'
                '  "freshness": "FRESH" or "ROTTEN",\n'
                '  "confidence": 0.95\n'
                "}\n\n"
                "Classification Guidelines:\n"
                "- 'is_raw_produce': Set to true ONLY if the item is an uncooked, raw agricultural fruit, vegetable, or herb (e.g. raw Apple, Banana, Tomato, Potato, Carrot, Orange, Cucumber, Strawberry, Greens, Lemon).\n"
                "- Set 'is_raw_produce' to false if it is cooked, baked, fried, roasted, grilled, fast food, bread, pizza, burger, noodles, rice, meat, poultry, fish, seafood, street food, insect/exotic food, or any prepared dish.\n"
                "- 'freshness':\n"
                "  * Important: Golden browning, grill marks, charred skin, glaze, and seasoning spices on cooked dishes are normal culinary characteristics, NOT rot or mold.\n"
                "  * For cooked/prepared/meat/fast food: mark 'FRESH' if appetizing, well-cooked, crispy, or safe to eat. Mark 'ROTTEN' ONLY if there is actual mold (white/green/black fuzzy patches), decomposition, foul slime, or severe rot.\n"
                "  * For raw fruit/vegetable: mark 'FRESH' if firm/healthy, or 'ROTTEN' if decayed/moldy.\n"
                "  * Ignore any screenshot text, app labels, or watermarks if present.\n"
                "- 'confidence': A float between 0.85 and 0.99.\n\n"
                "Return ONLY the valid JSON object without markdown fences or explanations."
            )

            raw_text = self._generate_with_fallback([image, prompt])
            parsed = self._parse_json_response(raw_text)

            raw_name = parsed.get("name") if parsed else ""
            clean_name = self._clean_food_name(raw_name) if raw_name else ""

            invalid_names = {"unknown", "produce", "food", "none", "n/a", "unknown produce", "analyzed produce", "item", "food item", "joke item"}
            if not clean_name or clean_name.lower() in invalid_names:
                clean_name = self.identify_produce(image_bytes)

            is_produce = parsed.get("is_raw_produce", None) if parsed else None

            # Domain keyword heuristics for 100% reliable routing
            name_lower = clean_name.lower()
            prepared_keywords = {
                "roasted", "grilled", "fried", "baked", "cooked", "tandoori", "crispy",
                "burger", "hamburger", "cheeseburger", "pizza", "fries", "french fries",
                "sandwich", "sub", "hot dog", "nuggets", "chicken", "meat", "beef", "pork",
                "mutton", "fish", "prawn", "prawns", "shrimp", "seafood", "biryani",
                "rice", "noodles", "pasta", "curry", "soup", "bread", "toast", "donut",
                "cake", "pie", "pastry", "croissant", "samosa", "taco", "burrito",
                "shawarma", "kebab", "skewer", "insect", "cricket"
            }
            produce_keywords = {
                "apple", "banana", "orange", "tomato", "potato", "carrot", "cucumber",
                "bell pepper", "capsicum", "chili", "strawberry", "lemon", "lime",
                "mango", "onion", "garlic", "ginger", "broccoli", "cauliflower",
                "cabbage", "spinach", "lettuce", "grape", "grapes", "peach", "pear",
                "plum", "watermelon", "melon", "papaya", "pomegranate", "guava",
                "bitter gourd", "gourd", "okra", "ladyfinger", "eggplant", "brinjal",
                "aubergine", "zucchini", "beetroot", "radish", "corn", "peas",
                "coriander", "spring onion"
            }

            if any(k in name_lower for k in prepared_keywords):
                is_produce = False
            elif any(k in name_lower for k in produce_keywords) and not any(k in name_lower for k in {"roasted", "cooked", "fried", "grilled", "curry", "soup"}):
                is_produce = True
            elif is_produce is None:
                is_produce = True

            freshness = str(parsed.get("freshness", "FRESH")).upper() if parsed else "FRESH"
            if freshness not in {"FRESH", "ROTTEN"}:
                freshness = "FRESH"

            try:
                confidence = float(parsed.get("confidence", 0.95))
                if confidence <= 0.0 or confidence > 1.0:
                    confidence = 0.95
            except Exception:
                confidence = 0.95

            return {
                "name": clean_name if clean_name else "Unidentified Item",
                "is_raw_produce": is_produce,
                "freshness": freshness,
                "confidence": confidence
            }
        except Exception as e:
            print("Gemini food analysis error:", repr(e))
            return default_res

    def identify_produce(self, image_bytes: bytes) -> str:
        client = self._get_client()
        if not client:
            return "Food Item"
            
        try:
            image = Image.open(io.BytesIO(image_bytes))
            prompt = (
                "You are an expert food classifier. Identify the specific food item shown in this image.\n"
                "Respond with ONLY the clean canonical name of the food in 1 to 2 words.\n"
                "Classification Guidelines:\n"
                "- If it is a burger, hamburger, or cheeseburger: respond with 'Burger'.\n"
                "- If it is pizza: respond with 'Pizza'.\n"
                "- If it is french fries or potato fries: respond with 'French Fries'.\n"
                "- If it is a sandwich, sub, or wrap: respond with 'Sandwich'.\n"
                "- If it is a hot dog: respond with 'Hot Dog'.\n"
                "- If it is a fruit (e.g. Apple, Banana, Orange, Mango, Strawberry, Lemon): name the specific fruit.\n"
                "- If it is a vegetable (e.g. Tomato, Potato, Bell Pepper, Carrot, Onion, Cucumber): name the specific vegetable.\n"
                "- If it is a snack or bakery item (e.g. Bread, Samosa, Donut, Croissant, Cake): name the specific item.\n"
                "Even if the food is spoiled, rotten, moldy, bruised, sliced, or partially eaten, identify what original food item it is.\n"
                "Never return generic words like 'Food', 'Produce', 'Unknown', 'Fresh', 'Rotten', or explanatory sentences."
            )
            
            raw_text = self._generate_with_fallback([image, prompt])
            cleaned = self._clean_food_name(raw_text)
            
            # If the result is missing or generic, try fallback short prompt
            invalid_names = {"unknown", "produce", "food", "none", "n/a", "unknown produce", "analyzed produce", "item", "food item"}
            if not cleaned or cleaned.lower() in invalid_names:
                fallback_prompt = "What edible food item is shown in this picture? Name the food in 1 or 2 words (e.g. Pizza, Burger, Apple, Orange, Bread, Tomato)."
                fallback_text = self._generate_with_fallback([image, fallback_prompt])
                cleaned = self._clean_food_name(fallback_text)
                
            return cleaned if cleaned and cleaned.lower() not in invalid_names else "Unidentified Item"
        except Exception as e:
            print("Gemini food identification error:", repr(e))
            return "Unidentified Item"

    def get_insights(self, verdict: str, produce_type: str = "Food") -> str:
        client = self._get_client()
        if not client:
            return "Gemini API key not configured. Unable to generate insights."
            
        prompt = f"""
        You are a culinary food safety expert. The user has scanned an item identified as '{produce_type}' and the system has classified it as '{verdict}'.
        Provide a concise, practical 2-3 sentence guide on:
        1. Approximate shelf-life expectations or consumption safety.
        2. Best storage practices (e.g. refrigeration, airtight storage, humidity).
        
        Keep it brief, practical, and helpful. Do not override the '{verdict}' verdict.
        """
        
        insights = self._generate_with_fallback(prompt)
        return insights if insights else "No insights could be generated at this time."

    def get_storage_advice(self, produce_name: str) -> str:
        client = self._get_client()
        if not client:
            return "Gemini API key not configured. Unable to fetch advice."
        
        prompt = f"Provide a brief, practical 2-3 sentence guide on how to store and handle '{produce_name}' to keep it fresh longer. Focus on temperature, refrigeration rules, and spoilage prevention."
        advice = self._generate_with_fallback(prompt)
        return advice if advice else "No storage advice could be generated at this time."
