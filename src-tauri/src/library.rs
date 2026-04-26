use crate::db::{delete_missing_tracks, load_tracks, open_db, save_track};
use crate::models::Track;

use lofty::prelude::Accessor;
use lofty::probe::Probe;
use lofty::file::TaggedFileExt;

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{UNIX_EPOCH};

#[tauri::command]
pub fn load_library() -> Result<Vec<Track>, String> {
  load_tracks()
}

#[tauri::command]
pub fn scan_music_folder(path: String) -> Result<Vec<Track>, String> {
  let root = PathBuf::from(path);

  if !root.exists() {
      return Err("Music folder does not exist".into());
  }

  let conn = open_db();
  let mut discovered_paths: Vec<String> = Vec::new();

  visit_dir(&root, &conn, &mut discovered_paths)?;

  delete_missing_tracks(&conn, &discovered_paths)?;

  load_tracks()
}

fn visit_dir(
  dir: &Path,
  conn: &rusqlite::Connection,
  discovered_paths: &mut Vec<String>,
) -> Result<(), String> {
  let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

  for entry in entries {
      let entry = entry.map_err(|e| e.to_string())?;
      let path = entry.path();

      if path.is_dir() {
          visit_dir(&path, conn, discovered_paths)?;
          continue;
      }

      if !is_audio_file(&path) {
          continue;
      }

      let track = read_track_metadata(&path)?;
      let modified_at = get_modified_timestamp(&path)?;

      discovered_paths.push(track.path.clone());

      save_track(conn, &track, modified_at)?;
  }

  Ok(())
}

fn is_audio_file(path: &Path) -> bool {
  let Some(ext) = path.extension() else {
      return false;
  };

  matches!(
      ext.to_string_lossy().to_lowercase().as_str(),
      "mp3" | "flac" | "wav" | "ogg" | "m4a" | "aac"
  )
}

fn read_track_metadata(path: &Path) -> Result<Track, String> {
  let full_path = path.to_string_lossy().to_string();

  let fallback_title = path
      .file_stem()
      .unwrap_or_default()
      .to_string_lossy()
      .to_string();

  let mut title = fallback_title;
  let mut artist = "Unknown Artist".to_string();
  let mut album = "Unknown Album".to_string();
  
  let mut track_number = 0;
  let mut disk_number = 0;
  let mut year = 0;

  if let Ok(tagged_file) = Probe::open(path)
      .map_err(|e| e.to_string())?
      .read()
  {
      if let Some(tag) = tagged_file.primary_tag() {
          if let Some(v) = tag.title() {
              title = v.to_string();
          }

          if let Some(v) = tag.artist() {
              artist = v.to_string();
          }

          if let Some(v) = tag.album() {
              album = v.to_string();
          }

          if let Some(v) = tag.track() {
              track_number = v;
          }

          if let Some(v) = tag.disk() {
              disk_number = v;
          }

          if let Some(v) = tag.date() {
              year = v.year;
          }

      }
  }

  Ok(Track {
      path: full_path,
      title,
      artist,
      album,
      track_number,
      disk_number,
      year
  })
}

fn get_modified_timestamp(path: &Path) -> Result<i64, String> {
  let metadata = fs::metadata(path).map_err(|e| e.to_string())?;

  let modified = metadata.modified().map_err(|e| e.to_string())?;

  let secs = modified
      .duration_since(UNIX_EPOCH)
      .map_err(|e| e.to_string())?
      .as_secs();

  Ok(secs as i64)
}
