import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { next, selectHasNext } from "../../../features/player/playerSlice";
import { useCallback } from "react";

export const Next = () => {
  const dispatch = useAppDispatch();
  const hasNext = useAppSelector(selectHasNext);

  const onnext = useCallback(() => {
    dispatch(next());
  }, [dispatch]);

  return (
    <button onClick={onnext} disabled={!hasNext}>
      Next
    </button>
  );
};
