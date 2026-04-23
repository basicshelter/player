import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import { Track } from "../../types/track";
import { loadLibrary } from "./libraryThunks";

interface LibraryState {
  songs: Track[];
  artists: string[];
  // albums: string[];
  loading: boolean;
  selectedArtist: string | null;
  // filters
  // searchQuery
  // sortMode
}

const initialState: LibraryState = {
  songs: [],
  artists: [],
  // albums: [],
  loading: false,
  selectedArtist: null,
};

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setSelectedArtist: (state, action: PayloadAction<string>) => {
      state.selectedArtist = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLibrary.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        loadLibrary.fulfilled,
        (state, action: PayloadAction<Track[]>) => {
          state.loading = false;
          state.songs = action.payload;
          state.artists = action.payload.reduce<string[]>(
            (acc, track) =>
              acc.includes(track.artist) ? acc : [...acc, track.artist],
            [],
          );
        },
      )
      .addCase(loadLibrary.rejected, (state, action) => {
        state.loading = false;
        console.error(action.error.message ?? "Loading library failed");
      });
  },
});

export const { setSelectedArtist } = librarySlice.actions;

export const selectSongs = (state: RootState) => state.library.songs;
export const selectArtists = (state: RootState) => state.library.artists;
export const selectSelectedArtist = (state: RootState) => state.library.selectedArtist;
export const selectLoading = (state: RootState) => state.library.loading;

export const selectArtistSongs = createSelector(
  selectSongs,
  selectSelectedArtist,
  (songs, artist) => songs.filter((s) => s.artist === artist),
);

export default librarySlice.reducer;
