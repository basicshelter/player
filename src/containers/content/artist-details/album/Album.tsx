import { CoverImage } from "../../../../shared/tauri/CoverImage";
import { Track } from "../../../../types/track";
import { Songs } from "../songs/Songs";

export type GroupedSongs = {
  title: string;
  year?: number;
  discs: {
    diskNumber?: number;
    songs: Track[];
  }[];
};

export const Album = ({
  album,
  coverPath,
}: {
  album: GroupedSongs;
  coverPath: string | null;
}) => {
  return (
    <div key={album.title} className="album">
      <h2>
        <span className="album-name">{album.title}</span>{" "}
        <span className="album-year">{album.year}</span>
      </h2>
      <div className="album-content">
        <CoverImage coverPath={coverPath} />
        {album.discs.length === 1 && <Songs songs={album.discs[0].songs} />}
        {album.discs.length > 1 && (
          <ul>
            {album.discs.map((d, i) => (
              <>
                <h3>Disk {d.diskNumber || i + 1}</h3>
                <Songs songs={d.songs} />
              </>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
