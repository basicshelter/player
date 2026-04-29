import { PlayPause } from "./play-pause/PlayPause";
import { Progress } from "./progress/Progress";
import { TrackDesc } from "./track-desc/TrackDesc";
import { Volume } from "./volume/Volume";
import "./NowPlayingBar.css";
import { Prev } from "./prev/Prev";
import { Next } from "./next/Next";

export function NowPlayingBar() {
  return (
    <div className="playerbar">
      <Progress />
      <div>
        <TrackDesc />
        <div className="controls">
          <Prev />
          <PlayPause />
          <Next />
        </div>
        <Volume />
      </div>
    </div>
  );
}
