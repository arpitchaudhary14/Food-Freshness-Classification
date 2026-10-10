# 🏗️ FreshFind System Architecture

FreshFind is built on a modern, decoupled client-server architecture, leveraging deep learning and generative AI for its core features.

## 1. Frontend (Client)
- **Framework:** React.js powered by Vite for lightning-fast HMR and building.
- **Styling:** Tailwind CSS for a fully responsive, utility-first UI design.
- **Icons:** Lucide-React for clean, consistent vector graphics.
- **State & Routing:** React Router DOM for seamless Single Page Application (SPA) navigation.
- **Responsibilities:** Handles user authentication flows, image capturing/uploading, rendering Grad-CAM visualizations, and displaying Gemini-generated storage advice.

## 2. Backend (Server)
- **Framework:** FastAPI (Python), chosen for its asynchronous capabilities and high performance.
- **Authentication:** PyJWT and bcrypt for secure password hashing and stateless token-based auth.
- **Database:** MongoDB (using Motor for async operations).
- **Responsibilities:** Serves RESTful endpoints, orchestrates machine learning inferences, manages user sessions and scan histories, and securely communicates with the Google Gemini API.

## 3. Machine Learning Pipeline (AI)
- **Core Model:** EfficientNetB0, pre-trained on ImageNet and fine-tuned on the Freshness44 dataset.
- **Inference Engine:** TensorFlow / Keras.
- **Explainability (XAI):** Custom Grad-CAM implementation that intercepts the last convolutional layer (`top_activation`) to generate heatmaps, overlaid on the original image using OpenCV.
- **Generative AI:** Google Gemini (via `google-genai` SDK) to dynamically generate rich content based on the predicted class (e.g., storage tips for 'Fresh Apple').

## 4. Deployment (Docker)
- **Frontend Container:** `node:18-alpine` (multi-stage build ready) serving the static dist.
- **Backend Container:** `python:3.10-slim` exposing the FastAPI server on port 8000.
- **Orchestration:** `docker-compose` to seamlessly link the frontend, backend, and environment variables.