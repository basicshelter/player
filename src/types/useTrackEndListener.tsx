import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useAppDispatch } from "../store/hooks";
import { next } from "../features/player/playerSlice";

export function useTrackEndListener() {
  const dispatch = useAppDispatch();
  let isListening = false;
  useEffect(() => {
    if (isListening) return;
    isListening = true;
    let unlisten: (() => void) | undefined;

    listen("track-ended", () => {
      console.log("track-ended");
      dispatch(next());
    }).then((fn) => (unlisten = fn));

    return () => {
      unlisten?.();
    };
  }, [dispatch]);
}
