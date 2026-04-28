import { useCallback } from "react";
import { useAppDispatch } from "../../../../store/hooks";
import { Track } from "../../../../types/track";
import { setQueue } from "../../../../features/player/playerSlice";

export const Songs = ({songs}: {songs: Track[]}) => {
  const dispatch = useAppDispatch();

  const play = useCallback(
    (songs: Track[], startIndex: number) => {
      dispatch(setQueue({ songs, startIndex }));
    },
    [dispatch],
  );
  return (
    <ol>
      {songs.map((s, ind, arr) => (
        <li key={s.path} className="song" onClick={() => play(arr, ind)}>
          {s.title}
        </li>
      ))}
    </ol>
  );
};
