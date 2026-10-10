import os
import io
from PIL import Image
import numpy as np

# Lazy load tensorflow to avoid slow startup unless predicting
class PredictionService:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None

    def _load_model(self):
        import tensorflow as tf
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            self.model = tf.keras.models.load_model(self.model_path)

    def predict(self, image_bytes: bytes):
        import tensorflow as tf
        self._load_model()
        
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image = image.resize((224, 224))
            img_array = np.array(image)
            img_array = np.expand_dims(img_array, axis=0) # (1, 224, 224, 3)
            # Match training preprocessing exactly
            # If standard EfficientNetB0, it expects raw [0-255] or handled by model's input layer.
            # Assuming the model handles preprocessing internally or expects standard RGB.
            
            prediction = self.model.predict(img_array, verbose=0)
            score = float(prediction[0][0])
            
            # Sigmoid output: 0 = Fresh, 1 = Rotten (Assuming standard binary)
            verdict = 'FRESH' if score < 0.5 else 'ROTTEN'
            confidence = (1 - score) if verdict == 'FRESH' else score
            
            return verdict, confidence, 'Analyzed Produce' # None for category since it's binary
        except Exception as e:
            raise RuntimeError(f"Error during prediction: {str(e)}")

    def explain(self, image_bytes: bytes):
        import tensorflow as tf
        from PIL import Image
        import numpy as np
        import base64
        from app.services.gradcam import make_gradcam_heatmap, generate_gradcam_overlay
        
        self._load_model()
        
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image = image.resize((224, 224))
            img_array = np.array(image)
            img_array_batch = np.expand_dims(img_array, axis=0)
            
            # Generate heatmap
            heatmap = make_gradcam_heatmap(img_array_batch, self.model, last_conv_layer_name=None)
            
            # Overlay
            overlay_img = generate_gradcam_overlay(img_array, heatmap)
            
            # Convert to base64
            overlay_pil = Image.fromarray(overlay_img)
            buffered = io.BytesIO()
            overlay_pil.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            return f"data:image/jpeg;base64,{img_str}"
        except Exception as e:
            raise RuntimeError(f"Error generating explanation: {str(e)}")
