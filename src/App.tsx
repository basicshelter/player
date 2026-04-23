import { useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { NowPlayingBar } from "./containers/now-playing-bar/NowPlayingBar";
import { Content } from "./containers/content/Content";
import { Sidebar } from "./containers/sidebar/Sidebar";
import { loadLibrary } from "./features/library/libraryThunks";
import { useAppDispatch } from "./store/hooks";
import "./App.css";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  return (
    <main className="app">
      <Group>
        <Panel collapsible collapsedSize={50} minSize={150} maxSize={"30%"}>
          <Sidebar />
        </Panel>
        <Separator />
        <Panel>
          <Content />
        </Panel>
      </Group>
      <NowPlayingBar />
    </main>
  );
}

export default App;
