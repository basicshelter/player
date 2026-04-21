import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

function App() {
  async function pickAndPlay() {
    const file = await open({
      multiple: false,
      filters: [
        {
          name: "Audio",
          extensions: ["mp3", "flac", "wav", "ogg"],
        },
      ],
    });

    if (file && typeof file === "string") {
      await invoke("play_file", { path: file });
    }
  }

  return (
    <main className="container">
      <h1>Welcome</h1>
      <div className="row">
        <button onClick={pickAndPlay}>Choose Song</button>
        <button onClick={() => invoke("pause")}>Pause</button>
        <button onClick={() => invoke("resume")}>Resume</button>
      </div>
    </main>
  );
}

export default App;
