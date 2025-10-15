Frontend: React app that plays HLS and manages overlay edits.
The HLS files are expected at public/hls/stream.m3u8 (ffmpeg writes here).

Key files:
- src/index.js
- src/App.js
- src/components/Player.js
- src/components/OverlayEditor.js
- public/hls -> holds stream.m3u8 produced by ffmpeg
