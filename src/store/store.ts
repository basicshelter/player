import { configureStore } from "@reduxjs/toolkit";
import librarySlice from "../features/library/librarySlice";
import playerSlice from "../features/player/playerSlice";
import { playerListenerMiddleware } from "../features/player/playerMiddleware";

export const store = configureStore({
  reducer: {
    player: playerSlice,
    library: librarySlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(playerListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
