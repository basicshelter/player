use std::{
  fs::File,
  sync::mpsc::{channel, Sender, RecvTimeoutError},
  thread,
  time::{Duration, Instant}
};
use rodio::{Decoder, DeviceSinkBuilder, Player, Source};
use tauri::{AppHandle, Emitter};

#[derive(Debug)]
pub enum AudioCommand {
  Play(String),
  Pause,
  Resume,
  Stop,
  Seek(f64),
  GetPosition(Sender<f64>),
  GetDuration(Sender<f64>),
}

#[tauri::command]
pub fn play_file(path: String, tx: tauri::State<Sender<AudioCommand>>) {
    println!("COMMAND RECEIVED: {}", path);

    match tx.send(AudioCommand::Play(path)) {
        Ok(_) => println!("SENT TO THREAD"),
        Err(e) => println!("SEND FAILED: {:?}", e),
    }
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

#[tauri::command]
pub fn get_position(tx: tauri::State<Sender<AudioCommand>>) -> f64 {
    let (reply_tx, reply_rx) = channel();

    let _ = tx.send(AudioCommand::GetPosition(reply_tx));

    reply_rx.recv().unwrap_or(0.0)
}

#[tauri::command]
pub fn get_duration(tx: tauri::State<Sender<AudioCommand>>) -> f64 {
    let (reply_tx, reply_rx) = channel();

    let _ = tx.send(AudioCommand::GetDuration(reply_tx));

    reply_rx.recv().unwrap_or(0.0)
}

#[tauri::command]
pub fn seek(pos: f64, tx: tauri::State<Sender<AudioCommand>>) {
    let _ = tx.send(AudioCommand::Seek(pos));
}


pub fn start_audio_thread(app: AppHandle) -> Sender<AudioCommand> {
    let (tx, rx) = channel::<AudioCommand>();

    thread::spawn(move || {
        println!("AUDIO THREAD STARTED");

        println!("Opening audio device...");
        let handle = DeviceSinkBuilder::open_default_sink()
            .expect("open default audio stream");
        println!("Audio device opened");

        let player = Player::connect_new(&handle.mixer());

        let mut started_at: Option<Instant> = None;
        let mut paused_pos = Duration::ZERO;
        let mut total_duration = Duration::ZERO;
        let mut is_paused = false;
        let mut was_playing = false;

        loop {
            match rx.recv_timeout(Duration::from_millis(100)) {
                Ok(cmd) => {
                    // println!("COMMAND RECEIVED IN THREAD: {:?}", cmd);

                    match cmd {
                        AudioCommand::Play(path) => {
                            println!("PLAY RECEIVED: {}", path);

                            player.stop();

                            if let Ok(file) = File::open(&path) {
                                if let Ok(source) = Decoder::try_from(file) {
                                    total_duration =
                                        source.total_duration().unwrap_or(Duration::ZERO);

                                    player.append(source);
                                    player.play();

                                    started_at = Some(Instant::now());
                                    paused_pos = Duration::ZERO;
                                    is_paused = false;
                                    was_playing = true;
                                } else {
                                    println!("Failed to decode file");
                                }
                            } else {
                                println!("Failed to open file");
                            }
                        }

                        AudioCommand::Pause => {
                            player.pause();

                            if let Some(start) = started_at.take() {
                                paused_pos += start.elapsed();
                            }

                            is_paused = true;
                        }

                        AudioCommand::Resume => {
                            player.play();
                            started_at = Some(Instant::now());
                            is_paused = false;
                        }

                        AudioCommand::Stop => {
                            player.stop();
                            was_playing = false;
                        }

                        AudioCommand::GetPosition(reply) => {
                            let pos = if let Some(start) = started_at {
                                paused_pos + start.elapsed()
                            } else {
                                paused_pos
                            };

                            let _ = reply.send(pos.as_secs_f64());
                        }

                        AudioCommand::GetDuration(reply) => {
                            let _ = reply.send(total_duration.as_secs_f64());
                        }

                        AudioCommand::Seek(sec) => {
                            let target = Duration::from_secs_f64(sec);

                            match player.try_seek(target) {
                                Ok(_) => {
                                    paused_pos = target;

                                    if is_paused {
                                        started_at = None;
                                    } else {
                                        started_at = Some(Instant::now());
                                    }
                                }
                                Err(e) => println!("seek failed: {:?}", e),
                            }
                        }
                    }
                }

                Err(RecvTimeoutError::Timeout) => {
                    // normal, just continue
                }

                Err(RecvTimeoutError::Disconnected) => {
                    println!("CHANNEL CLOSED");
                    break;
                }
            }

            // Track end detection
            if was_playing && player.empty() {
                println!("TRACK ENDED");

                was_playing = false;

                let _ = app.emit("track-ended", ());
            }
        }
    });

    tx
}