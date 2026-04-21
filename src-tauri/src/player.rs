use std::{
  fs::File,
  io::BufReader,
  sync::mpsc::{channel, Sender},
  thread,
};
use rodio::{Decoder, DeviceSinkBuilder, Player};

pub enum AudioCommand {
  Play(String),
  Pause,
  Resume,
  Stop,
}

#[tauri::command]
pub fn play_file(path: String, tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Play(path));
}

#[tauri::command]
pub fn pause(tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Pause);
}

#[tauri::command]
pub fn resume(tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Resume);
}

#[tauri::command]
pub fn stop(tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Stop);
}

pub fn start_audio_thread() -> Sender<AudioCommand> {
    let (tx, rx) = channel::<AudioCommand>();

    thread::spawn(move || {
        let handle = DeviceSinkBuilder::open_default_sink() .expect("open default audio stream");
        let player = Player::connect_new(&handle.mixer());

        loop {
            match rx.recv() {
                Ok(AudioCommand::Play(path)) => {
                    player.stop();

                    if let Ok(file) = File::open(path) {
                        if let Ok(source) = Decoder::new(BufReader::new(file)) {
                            player.append(source);
                            player.play();
                        }
                    }
                }

                Ok(AudioCommand::Pause) => player.pause(),
                Ok(AudioCommand::Resume) => player.play(),
                Ok(AudioCommand::Stop) => player.stop(),

                Err(_) => break,
            }
        }
    });

    tx
}