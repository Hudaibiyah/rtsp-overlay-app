#!/bin/bash
# Usage: ./start_stream.sh "rtsp://..."
RTSP_URL="$1"
OUT_DIR="../frontend/public/hls"
mkdir -p "$OUT_DIR"

if [ -z "$RTSP_URL" ]; then
  echo "Usage: $0 <rtsp-url>"
  exit 1
fi

# Try to copy video codec; if incompatible, switch to libx264 by uncommenting the next line.
ffmpeg -i "$RTSP_URL" \
  -c:v copy -c:a aac -f hls \
  -hls_time 2 -hls_list_size 5 -hls_flags delete_segments \
  "$OUT_DIR/stream.m3u8"
