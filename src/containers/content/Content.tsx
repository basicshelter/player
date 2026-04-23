import { selectSelectedArtist } from "../../features/library/librarySlice";
import { useAppSelector } from "../../store/hooks";
import { ArtistDetails } from "./artist-details/ArtistDetails";
import "./Content.css";
import { Home } from "./home/Home";

export const Content = () => {
  const selectedArtist = useAppSelector(selectSelectedArtist);

  return (
    <div className="main">{selectedArtist ? <ArtistDetails artist={selectedArtist} /> : <Home />}</div>
  );
};
