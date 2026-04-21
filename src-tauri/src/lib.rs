use std::{
    fs::File,
    io::BufReader,
    sync::mpsc::{channel, Sender},
    thread,
};

use rodio::{Decoder, OutputStream, Sink};

enum AudioCommand {
    Play(String),
    Pause,
    Resume,
    Stop,
}

#[tauri::command]
fn play_file(path: String, tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Play(path));
}

#[tauri::command]
fn pause(tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Pause);
}

#[tauri::command]
fn resume(tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Resume);
}

#[tauri::command]
fn stop(tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Stop);
}

fn start_audio_thread() -> Sender<AudioCommand> {
    let (tx, rx) = channel::<AudioCommand>();

    thread::spawn(move || {
        let (_stream, handle) = OutputStream::try_default().unwrap();
        let sink = Sink::try_new(&handle).unwrap();

        loop {
            match rx.recv() {
                Ok(AudioCommand::Play(path)) => {
                    sink.stop();

                    if let Ok(file) = File::open(path) {
                        if let Ok(source) = Decoder::new(BufReader::new(file)) {
                            sink.append(source);
                            sink.play();
                        }
                    }
                }

                Ok(AudioCommand::Pause) => sink.pause(),
                Ok(AudioCommand::Resume) => sink.play(),
                Ok(AudioCommand::Stop) => sink.stop(),

                Err(_) => break,
            }
        }
    });

    tx
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(start_audio_thread())
        .invoke_handler(tauri::generate_handler![
            play_file,
            pause,
            resume,
            stop
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}