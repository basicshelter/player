use std::path::{Path, PathBuf};
use lofty::file::{TaggedFileExt};
use lofty::picture::PictureType;
use lofty::read_from_path;
use image::imageops::FilterType;
use lofty::tag::Accessor;
use sha1::{Sha1, Digest};
use tauri::Manager;

#[tauri::command]
pub fn get_cover_path(
    app: tauri::AppHandle,
    track_path: String,
) -> Option<String> {
    let conn = crate::db::open_db();
    get_or_create_cover(&app, &conn, &track_path)
}

fn album_key(artist: Option<&str>, album: Option<&str>) -> String {
    format!(
        "{}::{}",
        artist.unwrap_or("unknown").to_lowercase(),
        album.unwrap_or("unknown").to_lowercase()
    )
}

fn get_cover_from_db(conn: &rusqlite::Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT cover_path FROM albums WHERE album_key = ?1",
        [key],
        |row| row.get(0),
    ).ok()
}

fn upsert_album_cover(
    conn: &rusqlite::Connection,
    key: &str,
    artist: Option<&str>,
    album: Option<&str>,
    cover_path: &str,
) {
    conn.execute(
        r#"
        INSERT INTO albums (artist, album, cover_path, album_key)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(album_key)
        DO UPDATE SET cover_path = excluded.cover_path
        "#,
        (artist, album, cover_path, key),
    ).ok();
}

fn extract_album_info(path: &Path) -> (Option<String>, Option<String>) {
    let tagged = read_from_path(path).ok();

    if let Some(tagged) = tagged {
        for tag in tagged.tags() {
            let album = tag.album().map(|s| s.to_string());
            let artist = tag.artist()
                .or_else(|| tag.artist())
                .map(|s| s.to_string());

            if album.is_some() || artist.is_some() {
                return (artist, album);
            }
        }
    }

    (None, None)
}

pub fn hash_path(path: &str) -> String {
    let mut hasher = Sha1::new();
    hasher.update(path.as_bytes());
    format!("{:x}", hasher.finalize())
}
pub fn get_or_create_cover(
    app: &tauri::AppHandle,
    conn: &rusqlite::Connection,
    track_path: &str,
) -> Option<String> {
    let path = Path::new(track_path);

    // 1. extract album info
    let (artist, album) = extract_album_info(path);
    let key = album_key(artist.as_deref(), album.as_deref());

    // 2. DB lookup
    if let Some(cover) = get_cover_from_db(conn, &key) {
        return Some(cover);
    }

    // 3. cache path
    let hash = hash_path(&key);
    let mut cached = covers_dir(app);
    cached.push(format!("{hash}.jpg"));

    // 4. file cache check (important!)
    if cached.exists() {
        let path_str = cached.to_string_lossy().to_string();

        upsert_album_cover(
            conn,
            &key,
            artist.as_deref(),
            album.as_deref(),
            &path_str,
        );

        return Some(path_str);
    }

    // 5. extract
    let data = extract_embedded_cover(path)
        .or_else(|| find_folder_cover(path))?;

    let data = resize_image(&data).unwrap_or(data);

    // 6. write cache
    std::fs::write(&cached, &data).ok()?;

    let path_str = cached.to_string_lossy().to_string();

    // 7. store in DB
    upsert_album_cover(
        conn,
        &key,
        artist.as_deref(),
        album.as_deref(),
        &path_str,
    );

    Some(path_str)
}

pub fn find_folder_cover(path: &Path) -> Option<Vec<u8>> {
    let dir = path.parent()?;

    for name in ["cover.jpg", "folder.jpg", "cover.png", "folder.png"] {
        let p = dir.join(name);
        if p.exists() {
            return std::fs::read(p).ok();
        }
    }

    None
}
pub fn covers_dir(app: &tauri::AppHandle) -> PathBuf {
    let mut dir = app.path().app_data_dir().unwrap();
    dir.push("covers");

    std::fs::create_dir_all(&dir).ok();
    dir
}

pub fn extract_embedded_cover(path: &Path) -> Option<Vec<u8>> {
    let tagged = read_from_path(path).ok()?;

    // Iterate all tags (important, not just primary)
    for tag in tagged.tags() {
        for pic in tag.pictures() {
            // Prefer front cover if available
            if pic.pic_type() == PictureType::CoverFront {
                return Some(pic.data().to_vec());
            }
        }
    }

    // fallback: any picture
    for tag in tagged.tags() {
        if let Some(pic) = tag.pictures().first() {
            return Some(pic.data().to_vec());
        }
    }

    None
}

pub fn resize_image(data: &[u8]) -> Option<Vec<u8>> {
    let img = image::load_from_memory(data).ok()?;
    let resized = img.resize(512, 512, FilterType::Lanczos3);

    let mut out = Vec::new();
    resized.write_to(&mut std::io::Cursor::new(&mut out), image::ImageFormat::Jpeg).ok()?;

    Some(out)
}
