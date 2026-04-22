import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import { Track } from "../../types/track";
import { pause, playFile, resume } from "./playerThunks";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  // volume: number;
  // queue: Track[];
  // repeatMode;
  // shuffle;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(playFile.fulfilled, (state) => {
        state.isPlaying = true;
      })
      .addCase(pause.fulfilled, (state) => {
        state.isPlaying = false;
      })
      .addCase(resume.fulfilled, (state) => {
        state.isPlaying = true;
      });
  },
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
    },
  },
});

export const {setCurrentTrack} = playerSlice.actions;

export const selectCurrentTrack = (state: RootState) =>
  state.player.currentTrack;
export const selectIsPlaying = (state: RootState) => state.player.isPlaying;
export const selectCurrentTime = (state: RootState) => state.player.currentTime;
export const selectDuration = (state: RootState) => state.player.duration;

export default playerSlice.reducer;
