import { convertFileSrc } from "@tauri-apps/api/core";
import FallbackSvg from "../../assets/media-playback-playing-symbolic.svg?react";
import { useAppSelector } from "../../store/hooks";
import { selectCover } from "../../features/player/playerSlice";

const Fallback = () => {
  return <FallbackSvg className="fallback" />;
};

export const CoverImage = () => {
  const coverPath = useAppSelector(selectCover);
  return (
    <div className="cover-image">
      {coverPath ? <img src={convertFileSrc(coverPath)} /> : <Fallback />}
    </div>
  );
};
