import { useEffect } from "react";
import { NowPlayingBar } from "./containers/now-playing-bar/NowPlayingBar";
import { Content } from "./containers/content/Content";
import { Sidebar } from "./containers/sidebar/Sidebar";
import "./App.css";
import { loadLibrary } from "./features/library/libraryThunks";
import { useAppDispatch } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  return (
    <main className="app">
      <Sidebar />
      <Content />
      <NowPlayingBar />
    </main>
  );
}

export default App;
