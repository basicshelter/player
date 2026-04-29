import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setVolume } from "../../../features/player/playerThunks";
import { selectVolume } from "../../../features/player/playerSlice";
import VolumeIcon from "../../../assets/audio-volume-medium-symbolic.svg?react";
import { Slider } from "../slider/Slider";

export const Volume = () => {
  const dispatch = useAppDispatch();
  const currentVolume = useAppSelector(selectVolume);
  const onChange = useCallback(
    (volume: number) => {
      dispatch(setVolume(volume / 100));
    },
    [dispatch],
  );

  return (
    <div className="volume">
      <VolumeIcon />
      <Slider
        id="volume"
        min={0}
        max={100}
        step={5}
        onChange={onChange}
        value={currentVolume}
      >
        {currentVolume}
      </Slider>
    </div>
  );
};
