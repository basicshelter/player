import { createListenerMiddleware } from "@reduxjs/toolkit";
import { getDuration, playFile } from "./playerThunks";

export const playerListenerMiddleware = createListenerMiddleware();

playerListenerMiddleware.startListening({
  actionCreator: playFile.fulfilled,
  effect: async (_, api) => {
    api.dispatch(getDuration())
  },
});
