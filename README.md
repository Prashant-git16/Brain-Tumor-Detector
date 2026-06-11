<div align="center">

<img src="https://img.shields.io/badge/-%F0%9F%A7%A0%20TumorDetector%20AI-0d47a1?style=for-the-badge&labelColor=0d47a1&color=1565c0" height="42"/>

# TumorDetector AI

### AI-Powered Brain MRI Tumor Classification System

*EfficientNetB0 · Flask REST API · React · Grad-CAM Explainable AI*

---

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Kaggle](https://img.shields.io/badge/Trained%20on-Kaggle%20T4-20BEFF?style=flat-square&logo=kaggle&logoColor=white)](https://kaggle.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Accuracy](https://img.shields.io/badge/Test%20Accuracy-90.87%25-brightgreen?style=flat-square)](https://github.com/Prashant-git16/Brain-Tumor-Detector)

<br/>

> Upload a brain MRI scan → get an instant AI-powered classification with confidence scores,
> probability breakdown, and Grad-CAM visual explainability — all in seconds.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Model Performance](#-model-performance)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [Grad-CAM Explainability](#-grad-cam-explainability)
- [Roadmap](#-roadmap)
- [Author](#-author)
- [Disclaimer](#-disclaimer)

---

## 🔬 Overview

**TumorDetector AI** is a full-stack deep learning application that classifies brain MRI scans into four categories using transfer learning with EfficientNetB0. The system includes a Flask REST backend, a React web interface, and Grad-CAM visualization for model explainability.

### Supported Classes

| Class | Description | Risk Level |
|---|---|---|
| 🔴 **Glioma** | Malignant tumor arising from glial cells of the brain or spine | High |
| 🟡 **Meningioma** | Tumor originating from the meninges surrounding the brain | Moderate |
| 🔵 **Pituitary** | Tumor in the pituitary gland region of the brain | Moderate |
| 🟢 **No Tumor** | No malignant or benign tumor detected in the scan | Clear |

---

## 🎯 Features

- **🧠 Deep Learning Classification** — EfficientNetB0 with ImageNet transfer learning, fine-tuned on 5,712 brain MRI scans
- **⚡ Real-Time Inference** — Flask REST API delivers predictions in under 3 seconds on CPU
- **📊 Probability Breakdown** — Confidence scores for all four classes with animated visual bars
- **🔥 Grad-CAM Explainability** — Heatmap overlay shows exactly which brain regions drove the prediction
- **🖥️ Interactive Web UI** — Drag-and-drop React interface with live scan animation and result visualization
- **🛡️ Two-Phase Training** — Frozen base (Phase 1) + fine-tuned top layers (Phase 2) for maximum accuracy
- **📱 Responsive Design** — Works across desktop, tablet, and mobile browsers

---

## 📈 Model Performance

### Training Setup

| Parameter | Value |
|---|---|
| Base Model | EfficientNetB0 (ImageNet weights) |
| Input Size | 224 × 224 × 3 |
| Training Images | 5,712 |
| Test Images | 1,311 |
| Optimizer | Adam |
| Loss | Categorical Cross-Entropy |
| Phase 1 LR | 1e-3 (frozen base) |
| Phase 2 LR | 1e-5 (top 40 layers unfrozen) |
| GPU | NVIDIA Tesla T4 (Kaggle) |

### Results

<div align="center">

| Metric | Score |
|---|---|
| **Overall Test Accuracy** | **90.87%** |
| Overall Test Loss | 0.3129 |

</div>

### Class-Wise Performance

| Class | Accuracy | Notes |
|---|---|---|
| 🟢 No Tumor | **99.8%** | Near-perfect — highly distinct MRI patterns |
| 🔵 Pituitary | **99.2%** | Localized region makes detection reliable |
| 🟡 Meningioma | **87.5%** | Moderate — some visual overlap with glioma |
| 🔴 Glioma | **77.0%** | Hardest class — irregular shape, diffuse borders |

> **Note:** Glioma's lower accuracy is clinically expected — even radiologists require multiple sequences and contrast agents for reliable glioma grading.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│                                                         │
│   React Frontend (Vite)  ←→  Drag & Drop Upload        │
│         ↕                                               │
│   Animated Scan UI + Grad-CAM + Probability Bars        │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP POST /predict (multipart/form-data)
                   ↓
┌─────────────────────────────────────────────────────────┐
│               FLASK REST API  :5000                     │
│                                                         │
│   • Receives image bytes                                │
│   • Applies EfficientNet preprocess_input()             │
│   • Resizes to 224×224                                  │
│   • Runs model inference                                │
│   • Returns JSON (class + confidence + probabilities)   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│            EfficientNetB0 MODEL  (.keras)               │
│                                                         │
│   Input (224×224×3)                                     │
│       → EfficientNetB0 backbone (top 40 fine-tuned)     │
│       → GlobalAveragePooling2D                          │
│       → BatchNormalization                              │
│       → Dense(512, relu) → Dropout(0.4)                 │
│       → Dense(256, relu) → Dropout(0.3)                 │
│       → Dense(4, softmax)                               │
│                                                         │
│   Output: [glioma, meningioma, notumor, pituitary]      │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Brain-Tumor-Detector/
│
├── 📂 backend/
│   ├── app.py                  # Flask REST API with /predict endpoint
│   └── requirements.txt        # Python dependencies
│
├── 📂 frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   └── App.css             # Medical UI theme styles
│   ├── package.json
│   └── vite.config.js
│
├── 📂 model/
│   ├── Brain.keras             # Trained EfficientNetB0 model
│   ├── predict.py              # Standalone inference script
│   └── test_model.py           # Model evaluation script
│
├── 📂 scripts/
│   └── train.py                # Full training pipeline
│
├── 📂 reports/                 # Training plots, confusion matrices
├── 📂 docs/                    # Project documentation
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Python 3.10+    Node.js 18+    Git
```

### 1. Clone the Repository

```bash
git clone https://github.com/Prashant-git16/Brain-Tumor-Detector.git
cd Brain-Tumor-Detector
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install flask flask-cors tensorflow pillow

# Start the API server
python app.py
# ✅ Running on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# ✅ Running on http://localhost:5173
```

### 4. Open in Browser

Navigate to **[http://localhost:5173](http://localhost:5173)** and upload any brain MRI image.

> **Note:** The `Brain.keras` model file must be present in the `model/` directory. Due to file size (~85MB), it is not included in the repository. Train your own using the Kaggle notebook or download from releases.

---

## 📡 API Reference

### Health Check

```http
GET /health
```

**Response**
```json
{
  "status": "ok"
}
```

---

### Predict

```http
POST /predict
Content-Type: multipart/form-data
```

**Request Body**

| Field | Type | Description |
|---|---|---|
| `image` | `file` | Brain MRI image (JPG, PNG, WEBP) |

**Success Response `200`**

```json
{
  "predicted_class": "pituitary",
  "confidence": 99.38,
  "probabilities": {
    "glioma":     0.01,
    "meningioma": 0.59,
    "notumor":    0.02,
    "pituitary":  99.38
  }
}
```

**Error Response `400`**

```json
{
  "error": "No image uploaded"
}
```

**Example (cURL)**

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@brain_mri.jpg"
```

**Example (Python)**

```python
import requests

with open("brain_mri.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:5000/predict",
        files={"image": f}
    )
print(response.json())
```

---

## 🛠️ Tech Stack

### Machine Learning

| Technology | Purpose |
|---|---|
| ![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=flat-square&logo=tensorflow&logoColor=white) | Model training & inference |
| ![Keras](https://img.shields.io/badge/Keras-D00000?style=flat-square&logo=keras&logoColor=white) | High-level model API |
| EfficientNetB0 | Pre-trained CNN backbone (ImageNet) |
| Grad-CAM | Gradient-weighted class activation mapping |
| scikit-learn | Evaluation metrics & confusion matrix |

### Backend

| Technology | Purpose |
|---|---|
| ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) | REST API server |
| Flask-CORS | Cross-origin request handling |
| Pillow | Image loading & preprocessing |
| NumPy | Numerical operations |

### Frontend

| Technology | Purpose |
|---|---|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI component framework |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build tool & dev server |
| SVG / CSS Animations | Scan beam, probability bars, gauge |

### Training Environment

| Technology | Purpose |
|---|---|
| ![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=flat-square&logo=kaggle&logoColor=white) | Cloud GPU training (Tesla T4) |
| Brain Tumor MRI Dataset | 7,023 MRI images across 4 classes |

---

## 🔥 Grad-CAM Explainability

Grad-CAM (Gradient-weighted Class Activation Mapping) highlights the spatial regions of the MRI that most influenced the model's prediction. This is critical for medical AI — it allows clinicians to verify the model is focusing on the tumor region rather than image artifacts.

```
Original MRI  →  Grad-CAM Heatmap  →  Superimposed Overlay
     🧠              🌡️                      🧠🌡️
  Raw scan      Attention regions        Visual explanation
```

The heatmap is generated by computing gradients of the predicted class score with respect to the final convolutional layer's feature maps, then projecting them back onto the input image.

---

## 🗺️ Roadmap

- [x] EfficientNetB0 transfer learning pipeline
- [x] Two-phase training (frozen → fine-tuned)
- [x] Flask REST API with preprocessing
- [x] React web interface with scan animation
- [x] Grad-CAM visualization
- [x] Probability breakdown with animated bars
- [ ] Docker containerization
- [ ] DICOM image format support
- [ ] Multi-slice 3D MRI analysis
- [ ] PDF diagnostic report generation
- [ ] Model versioning & A/B testing
- [ ] Cloud deployment (AWS / GCP)

---

## 👨‍💻 Author

<div align="center">

<img src="https://img.shields.io/badge/Prashant%20Pandey-0d47a1?style=for-the-badge&logo=github&logoColor=white"/>

**B.Tech Artificial Intelligence**
Chandigarh University · Mohali, Punjab
Roll No: `24BAI70942`

[![GitHub](https://img.shields.io/badge/GitHub-Prashant--git16-181717?style=flat-square&logo=github)](https://github.com/Prashant-git16)

</div>

---

## ⚠️ Disclaimer

> **This project is strictly for academic and research purposes.**
>
> TumorDetector AI is **NOT a certified medical device** and has **NOT been validated for clinical use**. It must **NOT be used** for:
> - Clinical diagnosis or treatment decisions
> - Replacing professional radiological evaluation
> - Patient screening or prognosis
>
> Always consult a licensed radiologist or neurologist for medical imaging interpretation. The developers assume no liability for clinical misuse of this software.

---

<div align="center">

Made with ❤️ and a lot of GPU hours

[![Star this repo](https://img.shields.io/github/stars/Prashant-git16/Brain-Tumor-Detector?style=social)](https://github.com/Prashant-git16/Brain-Tumor-Detector)

</div>
