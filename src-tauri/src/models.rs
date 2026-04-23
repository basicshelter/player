use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct Track {
    pub path: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub track_number: u32,
    pub disk_number: u32,
    pub year: u16,
}
