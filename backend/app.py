from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import config
from bson.errors import InvalidId

# ------------------------
# Initialize Flask & CORS
# ------------------------
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)

# ------------------------
# MongoDB setup
# ------------------------
client = MongoClient(config.MONGO_URI)
db = client[config.DB_NAME]
overlays = db.overlays

UPLOAD_FOLDER = os.path.abspath("./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ------------------------
# File upload route
# ------------------------
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    filename = file.filename
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    return jsonify({'url': f'http://localhost:5000/uploads/{filename}'})

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ------------------------
# CRUD for overlays
# ------------------------
@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    payload = request.json
    for key in ['x','y','width','height']:
        if key in payload:
            payload[key] = int(payload[key])
    res = overlays.insert_one(payload)
    payload['_id'] = str(res.inserted_id)
    return jsonify(payload), 201

@app.route('/api/overlays', methods=['GET'])
def list_overlays():
    items = []
    for doc in overlays.find():
        doc['_id'] = str(doc['_id'])
        items.append(doc)
    return jsonify(items)

@app.route('/api/overlays/<id>', methods=['PUT'])
def update_overlay(id):
    payload = request.json
    for key in ['x','y','width','height']:
        if key in payload:
            payload[key] = int(payload[key])
    overlays.find_one_and_update({'_id': ObjectId(id)}, {'$set': payload})
    doc = overlays.find_one({'_id': ObjectId(id)})
    doc['_id'] = str(doc['_id'])
    return jsonify(doc)



@app.route('/api/overlays/<id>', methods=['DELETE'])
def delete_overlay(id):
    try:
        try:
            obj_id = ObjectId(id)
        except InvalidId:
            return jsonify({'error': 'Invalid ID format'}), 400

        res = overlays.delete_one({'_id': obj_id})
        if res.deleted_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404
        return jsonify({'status': 'deleted'})
    except Exception as e:
        print("Error in delete_overlay:", e)
        return jsonify({'error': str(e)}), 500


# ------------------------
# Serve HLS files
# ------------------------
@app.route('/hls/<path:filename>')
def hls_files(filename):
    folder = os.path.abspath(config.HLS_FOLDER)
    return send_from_directory(folder, filename)

# ------------------------
# Run Flask
# ------------------------
if __name__ == '__main__':
    app.run(port=5000, debug=True)
