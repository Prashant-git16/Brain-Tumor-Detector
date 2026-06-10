Brain Tumor AI Detector

AI-powered Brain MRI classification system using EfficientNetB0, Flask, React, and Grad-CAM Explainable AI.

Overview

Brain Tumor AI Detector is a deep learning based medical imaging application that classifies MRI brain scans into four categories:

Glioma
Meningioma
Pituitary
No Tumor

The system provides:

Real-time MRI classification
Confidence scores
Probability breakdown
Explainable AI visualization (Grad-CAM)
Interactive web interface
Features

✅ EfficientNetB0 Transfer Learning

✅ TensorFlow/Keras Model

✅ Flask REST API

✅ React Frontend

✅ Grad-CAM Explainability

✅ Probability Breakdown

✅ Medical Disclaimer System

✅ MRI Upload and Analysis

Supported Classes
Class	Description
Glioma	Tumor arising from glial cells
Meningioma	Tumor originating from meninges
Pituitary	Tumor in pituitary gland
No Tumor	No tumor detected
Model Performance
Dataset
Metric	Value
Training Images	5600
Testing Images	1600
Classes	4
Input Size	224×224
Test Accuracy
90.87%
Class-wise Accuracy
Class	Accuracy
Glioma	77.0%
Meningioma	87.5%
No Tumor	99.8%
Pituitary	99.2%
Confusion Matrix

Explainable AI (Grad-CAM)

Grad-CAM is used to visualize image regions that contribute most to model predictions.

System Architecture
MRI Image
    ↓
React Frontend
    ↓
Flask API
    ↓
EfficientNetB0 Model
    ↓
Prediction
    ↓
Grad-CAM
    ↓
Visualization
API Endpoint
Health Check
GET /health

Response

{
  "status": "ok"
}
Prediction
POST /predict

Form Data

image=<MRI Image>

Response

{
  "predicted_class": "pituitary",
  "confidence": 99.2,
  "probabilities": {
    "glioma": 0.1,
    "meningioma": 0.2,
    "notumor": 0.5,
    "pituitary": 99.2
  }
}
Installation
Backend
cd backend

pip install -r requirements.txt

python app.py
Frontend
cd frontend

npm install

npm run dev
Tech Stack
Machine Learning
TensorFlow
Keras
EfficientNetB0
Grad-CAM
Backend
Flask
Flask-CORS
Frontend
React
Vite
Project Screenshots
Upload MRI

Prediction Result

Grad-CAM Visualization

Future Improvements
Docker Deployment
Cloud Hosting
Multi-slice MRI Support
DICOM Image Support
PDF Medical Reports
User Authentication
Disclaimer

This project is intended for academic and research purposes only.

It does not provide medical diagnosis and must not be used as a substitute for professional medical advice.

Author

Prashant Pandey

Chandigarh University

GitHub:
https://github.com/Prashant-git16