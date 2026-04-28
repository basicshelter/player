import { convertFileSrc } from "@tauri-apps/api/core";
import FallbackSvg from "../../assets/media-playback-playing-symbolic.svg?react";

const Fallback = () => {
  return <FallbackSvg className="fallback" />;
};

export const CoverImage = ({ coverPath }: { coverPath: string | null }) => {
  return (
    <div className="cover-image">
      {coverPath ? <img src={convertFileSrc(coverPath)} /> : <Fallback />}
    </div>
  );
};
