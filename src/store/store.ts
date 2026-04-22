import { configureStore } from "@reduxjs/toolkit";
import librarySlice from "../features/library/librarySlice";
import playerSlice from "../features/player/playerSlice";

export const store = configureStore({
  reducer: {
    player: playerSlice,
    library: librarySlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
