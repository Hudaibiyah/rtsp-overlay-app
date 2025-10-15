import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Rnd } from "react-rnd";
import Hls from "hls.js";

export default function Player() {
  const videoRef = useRef();
  const [overlays, setOverlays] = useState([]);
  const [newText, setNewText] = useState("");

  const hlsUrl = "http://localhost:5000/hls/stream.m3u8";

  // Initialize HLS video
  useEffect(() => {
    if (!videoRef.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch(err => console.log(err));
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = hlsUrl;
      videoRef.current.addEventListener("loadedmetadata", () => videoRef.current.play());
    }
  }, [hlsUrl]);

  // Load overlays from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/overlays")
      .then(res => setOverlays(res.data))
      .catch(err => console.error(err));
  }, []);

  // Add text overlay
  const addOverlay = async () => {
    if (!newText.trim()) return;
    const payload = { type: "text", content: newText, x: 50, y: 50, width: 200, height: 50 };
    const res = await axios.post("http://localhost:5000/api/overlays", payload);
    setOverlays(prev => [...prev, res.data]);
    setNewText("");
  };

  // Save overlay
  const saveOverlay = async (id, updates) => {
    const { _id, ...payload } = updates;
    const res = await axios.put(`http://localhost:5000/api/overlays/${id}`, payload);
    setOverlays(prev => prev.map(o => o._id === id ? res.data : o));
  };

  // Delete overlay
  const deleteOverlay = async (id) => {
    await axios.delete(`http://localhost:5000/api/overlays/${id}`);
    setOverlays(prev => prev.filter(o => o._id !== id));
  };

  // Upload image/logo overlay
  const uploadOverlay = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:5000/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const payload = { type: "image", content: res.data.url, x: 50, y: 50, width: 100, height: 100 };
    const overlayRes = await axios.post("http://localhost:5000/api/overlays", payload);
    setOverlays(prev => [...prev, overlayRes.data]);
  };

  return (
    <div style={{ width: "640px", margin: "20px auto", position: "relative" }}>
      {/* Video */}
      <video
        ref={videoRef}
        controls
        width="640"
        height="360"
        muted
        style={{ display: "block", background: "black", borderRadius: "8px" }}
      />

      {/* Overlays */}
      {overlays.map(o => (
        <Rnd
          key={o._id}
          size={{ width: o.width, height: o.height }}
          position={{ x: o.x, y: o.y }}
          bounds="parent"
          onDragStop={(e, d) => saveOverlay(o._id, { ...o, x: d.x, y: d.y })}
          onResizeStop={(e, dir, ref, delta, pos) =>
            saveOverlay(o._id, {
              ...o,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              x: pos.x,
              y: pos.y
            })
          }
          style={{
            position: "absolute",
            border: o.type === "text" ? "1px dashed #ddd" : "none",
            background: o.type === "text" ? "rgba(255,255,255,0.5)" : "transparent",
            borderRadius: "4px"
          }}
        >
          {o.type === "text" ? (
            <textarea
              value={o.content}
              onChange={e => setOverlays(prev => prev.map(obj => obj._id === o._id ? { ...obj, content: e.target.value } : obj))}
              onBlur={e => saveOverlay(o._id, { ...o, content: e.target.value })}
              style={{ width: "100%", height: "100%", resize: "none", border: "none", background: "transparent", padding: "4px" }}
            />
          ) : (
            <img src={o.content} alt="overlay" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          )}
          <button onClick={() => deleteOverlay(o._id)} style={{ fontSize: "12px", marginTop: "2px" }}>Delete</button>
        </Rnd>
      ))}

      {/* Controls */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Enter overlay text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          style={{ padding: "5px", width: "50%" }}
        />
        <button onClick={addOverlay} className="btn btn-primary ms-2">Add Text</button>

        <input
          type="file"
          accept="image/*"
          onChange={e => uploadOverlay(e.target.files[0])}
          style={{ marginLeft: "10px" }}
        />
      </div>
    </div>
  );
}
