import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  async function play() {
    await invoke("play_file", {
      path: "/data/music/test.mp3",
    });
  }

  return (
    <main className="container">
      <h1>Welcome</h1>
      <div className="row">
        <button onClick={play}>Play Song</button>
        <button onClick={() => invoke("pause")}>Pause</button>
        <button onClick={() => invoke("resume")}>Resume</button>
      </div>
    </main>
  );
}

export default App;
