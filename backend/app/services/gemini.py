import os
import re
from google import genai
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

    def _generate_with_fallback(self, contents) -> str:
        client = self._get_client()
        if not client:
            return ""

        last_error = None
        for model_name in CANDIDATE_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
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
