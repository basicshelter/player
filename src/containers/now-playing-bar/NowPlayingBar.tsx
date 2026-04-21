import { invoke } from "@tauri-apps/api/core";
import './NowPlayingBar.css';

export function NowPlayingBar({
  file,
  isPlaying,
  setIsPlaying,
}: {
  file: string | null;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
}) {
  async function pause() {
    await invoke("pause");
    setIsPlaying(false);
  }

  async function resume() {
    await invoke("resume");
    setIsPlaying(true);
  }
  return (
    <div className="playerbar">
      <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {file ? file.split("/").pop() : "No track selected"}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {isPlaying ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={resume} disabled={!file}>
            Play
          </button>
        )}
      </div>
    </div>
  );
}
