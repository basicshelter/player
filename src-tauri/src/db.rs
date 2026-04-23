use std::fs;
use rusqlite::{params, Connection};
use dirs::data_local_dir;
use crate::models::Track;

pub fn open_db() -> Connection {
    let mut path = data_local_dir().unwrap();
    path.push("player");

    fs::create_dir_all(&path).unwrap();

    path.push("library.db");
    
    let conn = Connection::open(path).unwrap();
    init_schema(&conn);
    conn
   
}

pub fn init_schema(conn: &Connection) {
  conn.execute(
      "
      CREATE TABLE IF NOT EXISTS tracks (
          id INTEGER PRIMARY KEY,
          path TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          album TEXT NOT NULL,
          track_number INTEGER,
          disk_number INTEGER,
          year INTEGER,
          modified_at INTEGER NOT NULL
      )
      ",
      [],
  ).unwrap();
}

pub fn save_track(
    conn: &Connection,
    track: &Track,
    modified_at: i64,
) -> Result<(), String> {
    conn.execute(
        "
        INSERT INTO tracks (
            path,
            title,
            artist,
            album,
            track_number,
            disk_number,
            year,
            modified_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)

        ON CONFLICT(path) DO UPDATE SET
            title = excluded.title,
            artist = excluded.artist,
            album = excluded.album,
            track_number = excluded.track_number,
            disk_number = excluded.disk_number,
            year = excluded.year,
            modified_at = excluded.modified_at
        ",
        params![
            track.path,
            track.title,
            track.artist,
            track.album,
            track.track_number,
            track.disk_number,
            track.year,
            modified_at
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn load_tracks() -> Result<Vec<Track>, String> {
    let conn = open_db();

    let mut stmt = conn
        .prepare(
            "
            SELECT
                path,
                title,
                artist,
                album,
                track_number,
                disk_number,
                year
            FROM tracks
            ORDER BY
                artist COLLATE NOCASE,
                year COLLATE,
                album COLLATE NOCASE,
                track_number COLLATE
            ",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Track {
                path: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                album: row.get(3)?,
                track_number: row.get(4)?,
                disk_number: row.get(5)?,
                year: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut tracks = Vec::new();

    for row in rows {
        tracks.push(row.map_err(|e| e.to_string())?);
    }

    Ok(tracks)
}

pub fn delete_missing_tracks(
    conn: &Connection,
    existing_paths: &[String],
) -> Result<(), String> {
    let mut stmt = conn
        .prepare("SELECT path FROM tracks")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?;

    let db_paths: Vec<String> = rows
        .filter_map(Result::ok)
        .collect();

    for path in db_paths {
        if !existing_paths.contains(&path) {
            conn.execute(
                "DELETE FROM tracks WHERE path = ?1",
                params![path],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}
