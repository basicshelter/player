import { useCallback, useEffect } from "react";
import {
  selectCurrentSong,
  selectDuration,
  selectPosition,
} from "../../../features/player/playerSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getPosition, seek } from "../../../features/player/playerThunks";
import { Slider } from "../slider/Slider";

export const Progress = () => {
  const dispatch = useAppDispatch();
  const track = useAppSelector(selectCurrentSong);
  const position = useAppSelector(selectPosition);
  const duration = useAppSelector(selectDuration);

  useEffect(() => {
    if (!track) return;
    const id = setInterval(async () => {
      dispatch(getPosition());
    }, 250);

    return () => clearInterval(id);
  }, [track]);

  const onseek = useCallback(
    (pos: number) => {
      if (!track) return;
      dispatch(seek(pos));
    },
    [track, dispatch],
  );

  const formatTime = useCallback((sec: number) => {
    if (!isFinite(sec)) return "0:00";

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="progress">
      <Slider
        id="progress"
        min={0}
        max={duration}
        step={0.1}
        value={position}
        onChange={onseek}
        disabled={!track}
      >
        {formatTime(position)} / {formatTime(duration)}
      </Slider>
    </div>
  );
};
