import { createAsyncThunk } from "@reduxjs/toolkit";
import { tauriApi } from "../../shared/tauri/api";

export const playFile = createAsyncThunk(
  "player/play",
  async (path: string) => {
    return await tauriApi.playFile(path);
  },
);

export const pause = createAsyncThunk("player/pause", async () => {
  return await tauriApi.pause();
});

export const resume = createAsyncThunk("player/resume", async () => {
  return await tauriApi.resume();
});

export const getPosition = createAsyncThunk("player/getPosition", async () => {
  return await tauriApi.getPosition();
});

export const getDuration = createAsyncThunk("player/getDuration", async () => {
  return await tauriApi.getDuration();
});

export const seek = createAsyncThunk("player/seek", async (pos: number) => {
  return await tauriApi.seek(pos);
});

export const setVolume = createAsyncThunk("player/setVolume", async (vol: number) => {
  await tauriApi.setVolume(vol);
  return vol;
});

export const getCover = createAsyncThunk("player/getCover", async (path: string) => {
  return await tauriApi.getCover(path);
});
