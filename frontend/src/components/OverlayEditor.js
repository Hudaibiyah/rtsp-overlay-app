import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import Hls from "hls.js";
import axios from "axios";

export default function OverlayEditor({ overlays = [], setOverlays }) {
  const videoRef = useRef();
  const [newText, setNewText] = useState("");

  const hlsUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

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
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current.play().catch(err => console.log(err));
      });
    }
  }, [hlsUrl]);

  // Load existing overlays from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/overlays")
      .then(res => setOverlays(res.data))
      .catch(err => console.error(err));
  }, [setOverlays]);

  // Add new text overlay
  const addTextOverlay = async () => {
    if (!newText.trim()) return;

    const payload = {
      type: "text",
      content: newText,
      x: 50,
      y: 50,
      width: 200,
      height: 50
    };

    try {
      const res = await axios.post("http://localhost:5000/api/overlays", payload);
      setOverlays(prev => [...prev, res.data]);
      setNewText("");
    } catch (err) {
      console.error(err);
    }
  };

  // Upload logo/icon overlay
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Create overlay pointing to backend URL
      const overlayPayload = {
        type: "image",
        content: `http://localhost:5000${res.data.url}`,
        x: 50,
        y: 50,
        width: 100,
        height: 100
      };

      const overlayRes = await axios.post("http://localhost:5000/api/overlays", overlayPayload);
      setOverlays(prev => [...prev, overlayRes.data]);
    } catch (err) {
      console.error(err);
    }
  };

  // Save overlay changes
  const saveOverlay = async (id, updates) => {
    const { _id, ...payload } = updates;
    try {
      const res = await axios.put(`http://localhost:5000/api/overlays/${id}`, payload);
      setOverlays(prev => prev.map(o => o._id === id ? res.data : o));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete overlay
  const deleteOverlay = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/overlays/${id}`);
      setOverlays(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error(err);
    }
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
        style={{ display: "block", background: "black" }}
      />

      {/* Render overlays */}
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
            background: o.type === "text" ? "rgba(255,255,255,0.5)" : "transparent"
          }}
        >
          {o.type === "text" ? (
            <textarea
              value={o.content}
              onChange={e => setOverlays(prev => prev.map(obj => obj._id === o._id ? { ...obj, content: e.target.value } : obj))}
              onBlur={e => saveOverlay(o._id, { ...o, content: e.target.value })}
              style={{
                width: "100%",
                height: "100%",
                resize: "none",
                border: "none",
                background: "transparent",
                padding: "2px"
              }}
            />
          ) : (
            <img
              src={o.content}
              alt="overlay"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
          <button
            onClick={() => deleteOverlay(o._id)}
            style={{ marginTop: "2px" }}
          >
            Delete
          </button>
        </Rnd>
      ))}

      {/* Add overlay controls */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Enter overlay text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          style={{ padding: "5px", width: "60%" }}
        />
        <button onClick={addTextOverlay} className="btn btn-primary ms-2">Add Text</button>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ marginLeft: "10px" }}
        />
      </div>
    </div>
  );
}
