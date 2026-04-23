import { useCallback } from "react";
import {
  selectArtists,
  setSelectedArtist,
} from "../../features/library/librarySlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import "./Sidebar.css";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const artists = useAppSelector(selectArtists);
  
  const selectArtist = useCallback((artist: string) => {
    dispatch(setSelectedArtist(artist));
  }, []);
  return (
    <div className="sidebar">
      <ul>
        {artists.map((artist) => (
          <li key={artist} onClick={() => selectArtist(artist)}>
            {artist}
          </li>
        ))}
      </ul>
    </div>
  );
}
