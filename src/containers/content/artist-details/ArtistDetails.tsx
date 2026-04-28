import { useMemo } from "react";
import { selectArtistCovers, selectArtistSongs } from "../../../features/library/librarySlice";
import { useAppSelector } from "../../../store/hooks";
import { Track } from "../../../types/track";
import { Album, GroupedSongs } from "./album/Album";

export const ArtistDetails = ({ artist }: { artist: string }) => {
  const songs = useAppSelector(selectArtistSongs);
  const covers = useAppSelector(selectArtistCovers);

  const songsGroupedByAlbum = useMemo(() => {
    const albumMap = new Map<
      string,
      {
        album: string;
        year?: number;
        discs: Map<number | undefined, Track[]>;
      }
    >();

    for (const song of songs) {
      const albumKey = song.album;
      const diskKey = song.disk_number;

      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, {
          album: albumKey,
          year: song.year,
          discs: new Map(),
        });
      }

      const albumEntry = albumMap.get(albumKey)!;

      if (!albumEntry.discs.has(diskKey)) {
        albumEntry.discs.set(diskKey, []);
      }

      albumEntry.discs.get(diskKey)!.push(song);
    }

    // Convert Maps → arrays
    return Array.from(albumMap.values()).map<GroupedSongs>((album) => ({
      title: album.album,
      year: album.year,
      discs: Array.from(album.discs.entries()).map(([diskNumber, songs]) => ({
        diskNumber,
        songs,
      })),
    })).sort((a,b) => (a.year || 0) - (b.year || 0));
  }, [songs]);

  return (
    <div className="artist-details">
      <h1>{artist}</h1>
      {songsGroupedByAlbum.map((a) => (
        <Album album={a} coverPath={covers[a.title].coverPath} />
      ))}
    </div>
  );
};
