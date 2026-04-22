import { useCallback } from "react";
import { selectSongs } from "../../features/library/librarySlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Track } from "../../types/track";
import "./Sidebar.css";
import { playFile } from "../../features/player/playerThunks";
import { setCurrentTrack } from "../../features/player/playerSlice";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const songs = useAppSelector(selectSongs);
  const play = useCallback(
    (track: Track) => {
      dispatch(setCurrentTrack(track));
      dispatch(playFile(track.path));
    },
    [dispatch],
  );
  return (
    <div className="sidebar">
      {songs.map((track) => (
        <div key={track.path} onClick={() => play(track)}>
          {track.artist} - {track.title}
        </div>
      ))}
    </div>
  );
}
