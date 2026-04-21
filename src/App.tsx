import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { NowPlayingBar } from "./containers/now-playing-bar/NowPlayingBar";
import { Content } from "./containers/content/Content";
import { Sidebar } from "./containers/sidebar/Sidebar";
import "./App.css";
import { Track } from "./types/track";

const MUSIC_PATH = "/data/music"; // change later

function App() {
  const [library, setLibrary] = useState<Track[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, []);

  async function loadLibrary() {
    const existing = await invoke<Track[]>("load_library");

    if (existing.length > 0) {
      setLibrary(existing);
    } else {
      await fullScan();
      
    }
  }
  async function fullScan() {
    const files = await invoke<Track[]>("scan_music_folder", {
      path: MUSIC_PATH,
    });
    setLibrary(files);
  }

  async function play(file: string) {
    setCurrentFile(file);
    setIsPlaying(true);

    await invoke("play_file", { path: file });
  }
  
  return (
    <main className="app">
      <Sidebar library={library} onPlay={play} />
      <Content />
      <NowPlayingBar
        file={currentFile}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </main>
  );
}

export default App;
