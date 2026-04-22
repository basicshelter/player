export const Progress = () => {
  // function formatTime(sec: number) {
  //   if (!isFinite(sec)) return "0:00";

  //   const m = Math.floor(sec / 60);
  //   const s = Math.floor(sec % 60);

  //   return `${m}:${s.toString().padStart(2, "0")}`;
  // }
  
  return (
    <div> Progress
      {/* <span>{formatTime(currentTime)}</span>

      <input
        type="range"
        min="0"
        max={duration}
        step="0.1"
        value={currentTime}
        onInput={(e) => setPreview(Number(e.currentTarget.value))}
        onChange={(e) => {
          audio.currentTime = Number(e.currentTarget.value);
        }}
      />

      <span>{formatTime(duration)}</span> */}
    </div>
  );
};
