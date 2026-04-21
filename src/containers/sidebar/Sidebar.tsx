import "./Sidebar.css";

export function Sidebar({
  library,
  onPlay,
}: {
  library: string[];
  onPlay: (file: string) => void;
}) {
  return (
    <div className="sidebar">
      {library.map((file) => (
        <div key={file} onClick={() => onPlay(file)}>
          {file.split("/").pop()}
        </div>
      ))}
    </div>
  );
}
