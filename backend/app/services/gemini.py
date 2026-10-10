import os
from google import genai

from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def get_insights(self, verdict: str, produce_type: str = "Produce") -> str:
        if not self.client:
            return "Gemini API key not configured. Unable to generate insights."
            
        prompt = f"""
        You are a food safety expert. The user has scanned an item which the local AI model thinks is '{produce_type}' and has classified it as '{verdict}'.
        Provide a concise, practical 2-3 sentence guide on:
        1. Approximate shelf-life expectations.
        2. Best storage conditions.
        
        Keep it brief and explicitly state that this is general guidance, not an exact scientific measurement. Do not override the '{verdict}' verdict.
        """
        
        try:
            # We use a standard stable model for text generation
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text
        except Exception as e:
            return f"Failed to generate AI insights: {str(e)}"

    def identify_produce(self, image_bytes: bytes) -> str:
        if not self.client:
            return "Analyzed Produce"
        try:
            from PIL import Image
            import io
            image = Image.open(io.BytesIO(image_bytes))
            prompt = "Identify the single main fruit/vegetable in this image. Respond with ONLY the specific name of the produce (e.g. 'Apple', 'Banana', 'Dragon Fruit'). No extra words, no punctuation."
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[image, prompt],
            )
            return response.text.strip()
        except Exception:
            return "Analyzed Produce"

    def get_storage_advice(self, produce_name: str) -> str:
        if not self.client:
            return "Gemini API key not configured. Unable to fetch advice."
        try:
            prompt = f"Provide a brief, practical 2-3 sentence guide on how to store and handle '{produce_name}' to keep it fresh longer. Focus on refrigeration rules and ethylene management if applicable."
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            return f"Failed to generate advice: {str(e)}"
