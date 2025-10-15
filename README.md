# RTSP Overlay App

A full-stack web application to play livestream videos from RTSP sources and add custom overlays such as text and logos on top of the video in real-time.

---

## Features

- **Live Video Streaming:** Play RTSP livestreams converted to HLS. Basic controls: play, pause, volume.
- **Overlay Options:** Add, resize, and position custom overlays (text or images) on the video.
- **CRUD API for Overlays:**
  - **Create:** Add new overlays with position, size, and content.
  - **Read:** Fetch all saved overlays.
  - **Update:** Modify existing overlays.
  - **Delete:** Remove overlays from the video.

---

## Tech Stack

- **Frontend:** React, `react-rnd` for draggable/resizable overlays  
- **Backend:** Python, Flask, Flask-CORS  
- **Database:** MongoDB  
- **Video Streaming:** HLS (converted from RTSP using FFmpeg)

---

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.12+
- MongoDB
- FFmpeg installed on your machine

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend


Create a virtual environment and install dependencies:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

Run the Flask server:
```bash
flask run
```
Backend will run on http://localhost:5000.

Frontend Setup
Navigate to the frontend folder:
```
cd frontend
```

Install dependencies:
```
npm install
```

Start the React app:
```
npm start
```
Frontend will run on http://localhost:3000.

Usage:

Open the app in your browser.
Enter the RTSP URL (converted to HLS if needed) in the video player.
Use the Add Text button to add text overlays.
Use the Upload Icon button to add image/logo overlays.
Drag and resize overlays as needed.
Overlays are saved automatically and can be updated or deleted.

API Endpoints:

POST /api/overlays - Create a new overlay
GET /api/overlays - List all overlays
PUT /api/overlays/<id> - Update overlay
DELETE /api/overlays/<id> - Delete overlay

# RTSP Overlay App

## Screenshots

### Screenshot 1
![Stream with overlays](screenshots/rstp-ss1.png)

### Screenshot 2
![Adding overlays](screenshots/rstp-ss2.png)

## Author
Syed Hudaibiah Zafir


Notes:
Ensure FFmpeg is installed to convert RTSP streams to HLS format.
MongoDB should be running locally or via a cloud provider.
Images uploaded for overlays are stored in the backend and referenced in MongoDB.

