import { selectCover, selectCurrentSong } from "../../../features/player/playerSlice";
import { CoverImage } from "../../../shared/tauri/CoverImage";
import { useAppSelector } from "../../../store/hooks";

export const TrackDesc = () => {
  const track = useAppSelector(selectCurrentSong);
  const coverPath = useAppSelector(selectCover);
  if (!track) return null;

  return (
    <div className="track">
      <CoverImage coverPath={coverPath}/>
      <div className="name">
        <div className="title">{track.title}</div>
        <div className="artist">{track.artist}</div>
      </div>
    </div>
  );
};
