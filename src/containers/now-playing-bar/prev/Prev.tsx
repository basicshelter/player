import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { prev, selectHasPrev } from "../../../features/player/playerSlice";
import { useCallback } from "react";

export const Prev = () => {
  const dispatch = useAppDispatch();
  const hasPrev = useAppSelector(selectHasPrev);

  const onprev = useCallback(() => {
    dispatch(prev());
  }, [dispatch]);

  return (
    <button onClick={onprev} disabled={!hasPrev}>
      Prev
    </button>
  );
};
