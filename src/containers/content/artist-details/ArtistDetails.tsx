import { useCallback, useMemo } from "react";
import { selectArtistSongs } from "../../../features/library/librarySlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Track } from "../../../types/track";
import { setQueue } from "../../../features/player/playerSlice";

type GroupedSongs = {
  album: string;
  year?: number;
  discs: {
    diskNumber?: number;
    songs: Track[];
  }[];
};

export const ArtistDetails = ({ artist }: { artist: string }) => {
  const dispatch = useAppDispatch();
  const songs = useAppSelector(selectArtistSongs);

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
      album: album.album,
      year: album.year,
      discs: Array.from(album.discs.entries()).map(([diskNumber, songs]) => ({
        diskNumber,
        songs,
      })),
    }));
  }, [songs]);

  const play = useCallback(
    (songs: Track[], startIndex: number) => {
      dispatch(setQueue({songs, startIndex}));
    },
    [dispatch],
  );

  return (
    <div className="artist-details">
      <h1>{artist}</h1>
      {songsGroupedByAlbum.map((a) => (
        <div key={a.album} className="album">
          <h2>
            {a.album} ({a.year})
          </h2>
          {a.discs.length === 1 && (
            <ol>
              {a.discs[0].songs.map((s, ind, arr) => (
                <li key={s.path} className="song" onClick={() => play(arr, ind)}>
                  {s.track_number} / {arr.length} - {s.title}
                </li>
              ))}
            </ol>
          )}
          {a.discs.length > 1 && (
            <ul>
              {a.discs.map((d, i) => (
                <>
                  <h3>Disk {d.diskNumber || i + 1}</h3>
                  <ol>
                    {d.songs.map((s, ind, arr) => (
                      <li key={s.path} className="song" onClick={() => play(arr, ind)}>
                        {s.track_number} / {arr.length} - {s.title}
                      </li>
                    ))}
                  </ol>
                </>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
