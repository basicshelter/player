import { createAsyncThunk } from "@reduxjs/toolkit";
import { tauriApi } from "../../shared/tauri/api";

export const playFile = createAsyncThunk("player/play", async (path: string) => {
  return await tauriApi.playFile(path);
});

export const pause = createAsyncThunk("player/pause", async () => {
  return await tauriApi.pause();
});

export const resume = createAsyncThunk("player/resume", async () => {
  return await tauriApi.resume();
});
