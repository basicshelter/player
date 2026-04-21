import { Track } from "../../types/track";
import "./Sidebar.css";

export function Sidebar({
  library,
  onPlay,
}: {
  library: Track[];
  onPlay: (path: string) => void;
}) {
  return (
    <div className="sidebar">
      {library.map((track) => (
        <div key={track.path} onClick={() => onPlay(track.path)}>
          {track.artist} - {track.title}
        </div>
      ))}
    </div>
  );
}
