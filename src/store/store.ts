import { configureStore } from "@reduxjs/toolkit";
import librarySlice, { libraryMiddleware } from "../features/library/librarySlice";
import playerSlice, { playerMiddleware } from "../features/player/playerSlice";

export const store = configureStore({
  reducer: {
    player: playerSlice,
    library: librarySlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(playerMiddleware.middleware)
      .prepend(libraryMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
