# 🍎 FreshFind - AI Food Freshness Classifier

FreshFind is an intelligent web application designed to combat food waste and promote food safety. By leveraging state-of-the-art Deep Learning (EfficientNetB0) and Gemini AI, FreshFind can visually analyze produce to determine its freshness (Fresh vs. Rotten) and provide custom storage handling advice dynamically.

## 🚀 Key Features
- **Instant AI Scanning:** Upload an image and immediately know if the produce is fresh or rotten.
- **Explainable AI (Grad-CAM):** See exactly *where* the AI looked on your image to make its decision via heatmaps.
- **Gemini AI Integration:** Automatically identify produce and generate custom storage guides on how to keep items fresh longer.
- **Beautiful Dashboard:** Track your scanning history with an interactive and vibrant interface.
- **Authentication:** Secure user login and registration system.

---

## 📊 Dataset, Model & Results
The core machine learning model uses **EfficientNetB0**, fine-tuned to classify 22 distinct categories of produce across two primary conditions: **Fresh** and **Rotten**.

### Dataset
This project uses the official **Freshness44** dataset for training and validation.
- **Source:** [Freshness44 Dataset on Kaggle](https://www.kaggle.com/datasets/siavash93/freshness44)

### Model Highlights
- **Base Architecture:** EfficientNetB0 (Transfer Learning)
- **Framework:** TensorFlow / Keras
- **Performance:** Achieved highly accurate validation accuracy on complex real-world datasets.
- **Explainability:** Utilizes Gradient-weighted Class Activation Mapping (Grad-CAM) to provide transparent AI decision-making.

### Model Evaluation Metrics
| Metric | Accuracy |
|--------|----------|
| **Training Accuracy** | 98.09% |
| **Validation Accuracy** | 98.43% |
| **Held-out Test Accuracy** | **98.56%** |

### Reproduction Parameters
If you wish to reproduce our training results using the `Food_Freshness_EfficientNetB0_Final_Clean.ipynb` notebook, here are the key parameters we used:
- **Optimizer:** Adam (Learning Rate: `1e-4`)
- **Loss Function:** Categorical Crossentropy
- **Epochs:** `20-30` (with Early Stopping patience of `5`)
- **Batch Size:** `32`
- **Data Augmentation:** Random Flip, Rotation, and Zoom

> **⚠️ Disclaimer:** Due to the inherent randomness in neural network initialization, GPU non-determinism, and library versions, we **do not guarantee** that you will get the exact same metrics or identical results, even when strictly following these parameters.


---

## 📁 Project Structure
The repository is split into independent but communicative parts:

```
Food-Freshness-Classification/
├── backend/          # FastAPI Python Backend
│   ├── app/          # API Routes, ML Services, DB logic
│   └── requirements.txt
├── frontend/         # React.js + Vite Frontend
│   ├── src/          # Components, Pages, Tailwind CSS
│   └── package.json
├── ml/               # Machine Learning & Jupyter Notebooks
│   ├── models/       # Contains 'best_finetuned_model.keras'
│   └── notebooks/    # Training scripts
├── configs/          # General configurations
├── docs/             # Architecture Documentation
└── README.md
```

---

## 🐳 Docker (Pre-built Images)

If you prefer not to install dependencies locally, you can use our pre-built Docker images hosted on Docker Hub.

* **Frontend Image:** [arpit00011/freshfind-frontend](https://hub.docker.com/r/arpit00011/freshfind-frontend)
* **Backend Image:** [arpit00011/freshfind-backend](https://hub.docker.com/r/arpit00011/freshfind-backend)

You can pull and run these images directly using Docker:

```bash
# Pull images
docker pull arpit00011/freshfind-backend:latest
docker pull arpit00011/freshfind-frontend:latest
```

---

## 🛠️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Food-Freshness-Classification.git
cd Food-Freshness-Classification
```

### 2. Backend Setup (FastAPI & ML)
You need Python 3.9+ installed.

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file inside the `backend` folder (or copy `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET_KEY=your_super_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*Note: Make sure MongoDB is running locally on port 27017.*

### 3. Frontend Setup (React & Vite)
You need Node.js and npm installed.

```bash
# Open a new terminal window
cd ../frontend

# Install node dependencies
npm install
```

---

## 🏃‍♂️ Running the Application

Once everything is installed, you need to run both the backend and frontend simultaneously in separate terminals.

### Start the Backend Server
```bash
cd backend
# Make sure your virtual environment is active!
uvicorn app.main:app --reload
```
*The backend will run on `http://localhost:8000`*

### Start the Frontend Server
```bash
cd frontend
npm run dev
```
*The frontend will run on `http://localhost:5173`*

Open your browser and navigate to `http://localhost:5173` to experience FreshFind!

---

## 💻 Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Lucide React
* **Backend:** FastAPI, Python, PyJWT
* **Database:** MongoDB (Motor Asyncio)
* **Machine Learning:** TensorFlow, Keras, EfficientNet, OpenCV
* **Generative AI:** Google Gemini (genai)
