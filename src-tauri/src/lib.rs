mod db;
mod library;
mod models;
mod player;

use library::*;
use player::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(start_audio_thread())
        .invoke_handler(tauri::generate_handler![
            play_file,
            pause,
            resume,
            stop,
            get_position,
            get_duration,
            seek,
            load_library,
            scan_music_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}