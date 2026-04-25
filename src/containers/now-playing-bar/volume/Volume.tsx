import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { setVolume } from "../../../features/player/playerThunks";
import { selectVolume } from "../../../features/player/playerSlice";

export const Volume = () => {
  const dispatch = useAppDispatch();
  const currentVolume = useAppSelector(selectVolume);
  const onChange = useCallback((volume: number) => {
    dispatch(setVolume(volume / 100));
  }, [dispatch]);

  return (
    <div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={currentVolume}
        onChange={(e) => {
          console.log(e.currentTarget.value);
          onChange(Number(e.currentTarget.value));
        }}
      />
    </div>
  );
}