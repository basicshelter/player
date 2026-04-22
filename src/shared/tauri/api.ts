import { invoke } from "@tauri-apps/api/core";
import { Track } from "../../types/track";

export const tauriApi = {
  playFile: (path: string) => invoke<Track>("play_file", { path }),
  pause: () => invoke("pause"),
  resume: () => invoke("resume"),
  // stop: () => invoke("stop"),
  loadLibrary: () => invoke<Track[]>("load_library"),
  scanMusicFolder: (path: string) =>
    invoke<Track[]>("scan_music_folder", { path }),
};
