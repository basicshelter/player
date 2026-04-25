import { createListenerMiddleware, createSelector, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, type RootState } from "../../store/store";
import { Track } from "../../types/track";
import {
  getDuration,
  getPosition,
  pause,
  playFile,
  resume,
} from "./playerThunks";

interface PlayerState {
  isPlaying: boolean;
  duration: number;
  position: number;
  // volume: number;
  queue: Track[];
  currentIndex: number;
  repeat: "off" | "one" | "all";
  shuffle: boolean;
}

const initialState: PlayerState = {
  isPlaying: false,
  duration: 0,
  position: 0,
  queue: [],
  currentIndex: 0,
  repeat: "off",
  shuffle: false,
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
    setQueue: (
      state,
      action: PayloadAction<{ songs: Track[]; startIndex: number }>,
    ) => {
      state.queue = action.payload.songs;
      state.currentIndex = action.payload.startIndex;
    },

    next: (state) => {
      if (state.currentIndex < state.queue.length - 1) {
        state.currentIndex++;
      }
    },

    prev: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
      }
    },
  },
});

export const { setQueue, next, prev } = playerSlice.actions;

export const selectCurrentIndex = (state: RootState) =>
  state.player.currentIndex;
export const selectQueue = (state: RootState) => state.player.queue;
export const selectIsPlaying = (state: RootState) => state.player.isPlaying;
export const selectPosition = (state: RootState) => state.player.position;
export const selectDuration = (state: RootState) => state.player.duration;

export const selectHasPrev = (state: RootState) =>
  state.player.currentIndex > 0;
export const selectHasNext = createSelector(
  selectQueue,
  selectCurrentIndex,
  (songs, index) => songs.length > index + 1,
);

export const selectCurrentSong = createSelector(
  selectQueue,
  selectCurrentIndex,
  (songs, index) => (songs.length > index ? songs[index] : null),
);


export default playerSlice.reducer;

export const listenerMiddleware = createListenerMiddleware();

const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch,
  {}
>();

startAppListening({
  actionCreator: setQueue,
  effect: async (_, api) => {
    const state = api.getState();
    await api.dispatch(
      playFile(state.player.queue[state.player.currentIndex].path),
    );
  },
});

startAppListening({
  matcher: isAnyOf(next, prev),
  effect: async (_, api) => {
    const originalState = api.getOriginalState();
    const state = api.getState();
    if (originalState.player.currentIndex === state.player.currentIndex) return;

    await api.dispatch(
      playFile(state.player.queue[state.player.currentIndex].path),
    );
  },
});

startAppListening({
  actionCreator: playFile.fulfilled,
  effect: async (_, api) => {
    await api.dispatch(getDuration());
  },
});

