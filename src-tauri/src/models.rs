use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct Track {
    pub path: String,
    pub title: String,
    pub artist: String,
    pub album: String,
}
