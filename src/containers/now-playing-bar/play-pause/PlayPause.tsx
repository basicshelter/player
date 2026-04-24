import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectCurrentSong,
  selectIsPlaying,
} from "../../../features/player/playerSlice";
import { useCallback } from "react";
import { pause, resume } from "../../../features/player/playerThunks";

export const PlayPause = () => {
  const dispatch = useAppDispatch();
  const playing = useAppSelector(selectIsPlaying);
  const track = useAppSelector(selectCurrentSong);

  const onpause = useCallback(() => {
    dispatch(pause());
  }, [dispatch]);
  const onresume = useCallback(() => {
    dispatch(resume());
  }, [dispatch]);

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {playing ? (
        <button onClick={onpause}>Pause</button>
      ) : (
        <button onClick={onresume} disabled={!track}>
          Play
        </button>
      )}
    </div>
  );
};
