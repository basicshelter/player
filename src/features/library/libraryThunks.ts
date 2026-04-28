import { createAsyncThunk } from "@reduxjs/toolkit";
import { tauriApi } from "../../shared/tauri/api";

const MUSIC_PATH = "/data/music";

export const loadLibrary = createAsyncThunk("library/load", async () => {
  const existing = await tauriApi.loadLibrary();
  if (existing.length > 0) return existing;
  return await tauriApi.scanMusicFolder(MUSIC_PATH);
});

export const loadAlbumCover = createAsyncThunk("library/loadAlbumCover", async (data: {artist: string, album: string, trackPath: string}) => {
  const coverPath = await tauriApi.getCover(data.trackPath);
  return { ...data, coverPath};
});