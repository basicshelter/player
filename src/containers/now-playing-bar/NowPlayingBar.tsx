import { PlayPause } from "./play-pause/PlayPause";
import { Progress } from "./progress/Progress";
import { TrackDesc } from "./track-desc/TrackDesc";
import { Volume } from "./volume/Volume";
import "./NowPlayingBar.css";

export function NowPlayingBar() {
  return (
    <div className="playerbar">
      <TrackDesc />
      <PlayPause />
      <Progress />
      <Volume />
    </div>
  );
}
