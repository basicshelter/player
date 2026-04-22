import { selectCurrentTrack } from "../../../features/player/playerSlice";
import { useAppSelector } from "../../../store/hooks";

export const TrackDesc = () => {
  const track = useAppSelector(selectCurrentTrack);
  if (!track) return null;

  return (
    <div className="track">
      <div className="cover">Cover</div>
      <div className="name">
        <div className="title">{track.title}</div>
        <div className="artist">{track.artist}</div>
      </div>
    </div>
  );
};
