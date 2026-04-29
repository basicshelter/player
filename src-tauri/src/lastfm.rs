use std::time::{Instant};

pub struct ScrobbleState {
    pub artist: String,
    pub track: String,
    pub album: Option<String>,
    pub duration: u64,

    pub started_at: Instant,
    pub elapsed_before_pause: u64,

    pub scrobbled: bool,
    pub is_playing: bool,
}

pub struct ScrobbleService {
  pub state: Option<ScrobbleState>,

  pub client: reqwest::Client,
  pub api_key: String,
  pub api_secret: String,
  pub session_key: String,
}

impl ScrobbleService {
  pub async fn on_play(
      &mut self,
      artist: String,
      track: String,
      album: Option<String>,
      duration: u64,
  ) {
      self.state = Some(ScrobbleState {
          artist: artist.clone(),
          track: track.clone(),
          album,
          duration,
          started_at: Instant::now(),
          elapsed_before_pause: 0,
          scrobbled: false,
          is_playing: true,
      });

      // fire and forget
      let _ = self.now_playing(&artist, &track).await;
  }

  pub fn on_pause(&mut self) {
    if let Some(state) = &mut self.state {
        if state.is_playing {
            state.elapsed_before_pause += state.started_at.elapsed().as_secs();
            state.is_playing = false;
        }
    }
  }

  pub fn on_resume(&mut self) {
    if let Some(state) = &mut self.state {
        if !state.is_playing {
            state.started_at = Instant::now();
            state.is_playing = true;
        }
    }
  }

  pub async fn on_stop(&mut self) {
    self.try_scrobble().await;
    self.state = None;
  }

  pub async fn tick(&mut self) {
    self.try_scrobble().await;
  }
  
  async fn try_scrobble(&mut self) {
    let Some(state) = &mut self.state else { return };

    if state.scrobbled || !state.is_playing {
        return;
    }

    let elapsed = state.elapsed_before_pause
        + state.started_at.elapsed().as_secs();

    let should_scrobble =
        elapsed >= state.duration / 2 || elapsed >= 240;

    if should_scrobble {
        let _ = self.scrobble(
            &state.artist,
            &state.track,
        ).await;

        state.scrobbled = true;
    }
  }
}

fn sign(params: &mut Vec<(&str, String)>, api_secret: &str) -> String {
  params.sort_by_key(|(k, _)| *k);

  let mut s = String::new();
  for (k, v) in params.iter() {
      s.push_str(k);
      s.push_str(v);
  }
  s.push_str(api_secret);

  format!("{:x}", md5::compute(s))
}