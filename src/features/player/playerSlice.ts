import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import { Track } from "../../types/track";
import {
  getDuration,
  getPosition,
  pause,
  playFile,
  resume,
} from "./playerThunks";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  // volume: number;
  // queue: Track[];
  // repeatMode;
  // shuffle;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  duration: 0,
  position: 0,
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
      })
      .addCase(
        getPosition.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.position = action.payload;
        },
      )
      .addCase(
        getDuration.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.duration = action.payload;
        },
      );
  },
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
    },
  },
});

export const { setCurrentTrack } = playerSlice.actions;

export const selectCurrentTrack = (state: RootState) =>
  state.player.currentTrack;
export const selectIsPlaying = (state: RootState) => state.player.isPlaying;
export const selectPosition = (state: RootState) => state.player.position;
export const selectDuration = (state: RootState) => state.player.duration;

export default playerSlice.reducer;
