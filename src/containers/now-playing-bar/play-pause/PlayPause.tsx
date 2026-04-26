import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectCurrentSong,
  selectIsPlaying,
} from "../../../features/player/playerSlice";
import { useCallback } from "react";
import { pause, resume } from "../../../features/player/playerThunks";
import PlayIcon from "../../../assets/media-playback-start.svg?react";
import PauseIcon from "../../../assets/media-playback-paused-symbolic.svg?react";

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
    <div>
      {playing ? (
        <button onClick={onpause}>
          <PauseIcon />
        </button>
      ) : (
        <button onClick={onresume} disabled={!track}>
          <PlayIcon />
        </button>
      )}
    </div>
  );
};
