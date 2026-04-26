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
    crate::cover::get_or_create_cover(&app, &track_path)
}

fn album_key(artist: Option<&str>, album: Option<&str>) -> String {
    format!(
        "{}::{}",
        artist.unwrap_or("unknown").to_lowercase(),
        album.unwrap_or("unknown").to_lowercase()
    )
}

fn extract_album_info(path: &str) -> (Option<String>, Option<String>) {
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
  track_path: &str,
) -> Option<String> {
    let (artist, album) = extract_album_info(track_path);
    let key = album_key(artist.as_deref(), album.as_deref());
    let hash = hash_path(&key);

  let mut cached = covers_dir(app);
  cached.push(format!("{hash}.jpg"));

  // 1. cache
  if cached.exists() {
      return Some(cached.to_string_lossy().to_string());
  }

  let path = Path::new(track_path);

  // 2. embedded
  let data = extract_embedded_cover(path)
      // 3. folder fallback
      .or_else(|| find_folder_cover(path))?;

  // 4. resize
  let data = resize_image(&data).unwrap_or(data);

  // 5. cache
  let saved = cache_cover(app, &hash, &data)?;

  Some(saved.to_string_lossy().to_string())
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

pub fn cache_cover(
  app: &tauri::AppHandle,
  hash: &str,
  data: &[u8],
) -> Option<PathBuf> {
  let mut path = covers_dir(app);
  path.push(format!("{hash}.jpg"));

  std::fs::write(&path, data).ok()?;
  Some(path)
}
