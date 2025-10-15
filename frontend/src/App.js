import React from 'react'
import Player from './components/Player'
import './styles.css'

export default function App(){
  const hlsUrl = '/hls/stream.m3u8';
  return (
    <div className="app">
      <h2></h2>
      <Player hlsUrl={hlsUrl} />
    </div>
  )
}
