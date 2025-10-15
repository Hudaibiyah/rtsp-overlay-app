import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'rtsp_app')
HLS_FOLDER = os.getenv('HLS_FOLDER', '../frontend/public/hls')  # path where ffmpeg writes .m3u8
