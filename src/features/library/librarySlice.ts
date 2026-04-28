import {
  createListenerMiddleware,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../../store/store";
import { Track } from "../../types/track";
import { loadAlbumCover, loadLibrary } from "./libraryThunks";

type AlbumCoverData = {
  trackPath: string;
  coverPath: string | null;
};

interface LibraryState {
  songs: Track[];
  artists: string[];
  covers: {
    [artist: string]: {
      [album: string]: AlbumCoverData;
    };
  };
  loading: boolean;
  selectedArtist: string | null;
  // filters
  // searchQuery
  // sortMode
}

const initialState: LibraryState = {
  songs: [],
  artists: [],
  covers: {},
  loading: false,
  selectedArtist: null,
};

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setSelectedArtist: (state, action: PayloadAction<string>) => {
      const artistSongs = state.songs.filter(
        (s) => s.artist === action.payload,
      );

      state.selectedArtist = action.payload;

      if (state.covers[action.payload]) return;

      state.covers[action.payload] = artistSongs.reduce<{
        [a: string]: AlbumCoverData;
      }>(
        (albums, song) =>
          albums[song.album]
            ? albums
            : {
                ...albums,
                [song.album]: { trackPath: song.path, coverPath: null },
              },
        {},
      );
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
      })
      .addCase(loadAlbumCover.fulfilled, (state, action) => {
        const { artist, album, coverPath } = action.payload;
        state.covers[artist][album].coverPath = coverPath;
      });
  },
});

export const { setSelectedArtist } = librarySlice.actions;

export const selectSongs = (state: RootState) => state.library.songs;
export const selectArtists = (state: RootState) => state.library.artists;
export const selectSelectedArtist = (state: RootState) =>
  state.library.selectedArtist;
export const selectLoading = (state: RootState) => state.library.loading;

export const selectArtistSongs = createSelector(
  selectSongs,
  selectSelectedArtist,
  (songs, artist) => songs.filter((s) => s.artist === artist),
);

export const selectArtistCovers = createSelector(
  selectSelectedArtist,
  (state: RootState) => state.library.covers,
  (artist, covers) => (artist ? covers[artist] : {}),
);

export default librarySlice.reducer;

export const libraryMiddleware = createListenerMiddleware();

const startAppListening = libraryMiddleware.startListening.withTypes<
  RootState,
  AppDispatch,
  {}
>();

startAppListening({
  actionCreator: setSelectedArtist,
  effect: async (action, api) => {
    const prevState = api.getOriginalState();
    if (prevState.library.covers[action.payload]) return;

    const state = api.getState();
    const coverData = state.library.covers[action.payload];
    for (const albumTitle in coverData) {
      const data = coverData[albumTitle];
      await api.dispatch(
        loadAlbumCover({
          artist: action.payload,
          album: albumTitle,
          trackPath: data.trackPath,
        }),
      );
    }
  },
});
