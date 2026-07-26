import { useEffect, useRef, useState } from "react";

const STORAGE_VOLUME = "meteomood-ambient-volume";

const SOUND_LABELS = {
  sunny: "Warm breeze",
  cloudy: "Soft breeze",
  windy: "Windy air",
  rainy: "Gentle rain",
  stormy: "Rainstorm",
  snow: "Winter hush",
};

const SOUND_PROFILES = {
  sunny: [
    { color: "brown", filter: "lowpass", frequency: 1050, gain: 0.22, rate: 0.08, depth: 0.22 },
  ],
  cloudy: [
    { color: "brown", filter: "lowpass", frequency: 850, gain: 0.28, rate: 0.06, depth: 0.2 },
  ],
  windy: [
    { color: "brown", filter: "bandpass", frequency: 520, gain: 0.78, rate: 0.17, depth: 0.48 },
    { color: "white", filter: "lowpass", frequency: 1750, gain: 0.12, rate: 0.1, depth: 0.35 },
  ],
  rainy: [
    { color: "white", filter: "highpass", frequency: 900, gain: 0.38, rate: 0.05, depth: 0.12 },
    { color: "brown", filter: "lowpass", frequency: 650, gain: 0.28, rate: 0.09, depth: 0.16 },
  ],
  stormy: [
    { color: "white", filter: "highpass", frequency: 720, gain: 0.48, rate: 0.07, depth: 0.18 },
    { color: "brown", filter: "lowpass", frequency: 520, gain: 0.52, rate: 0.11, depth: 0.28 },
  ],
  snow: [
    { color: "brown", filter: "lowpass", frequency: 700, gain: 0.18, rate: 0.045, depth: 0.14 },
  ],
};

function readSavedVolume() {
  const saved = Number.parseFloat(localStorage.getItem(STORAGE_VOLUME));
  return Number.isFinite(saved) ? Math.min(1, Math.max(0.15, saved)) : 0.55;
}

function makeNoiseBuffer(context, color) {
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const white = Math.random() * 2 - 1;

    if (color === "brown") {
      previous = (previous + 0.025 * white) / 1.025;
      samples[index] = previous * 3.2;
    } else {
      samples[index] = white;
    }
  }

  return buffer;
}

function addNoiseLayer(context, output, profile, nodes) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();

  source.buffer = makeNoiseBuffer(context, profile.color);
  source.loop = true;
  filter.type = profile.filter;
  filter.frequency.value = profile.frequency;
  filter.Q.value = profile.filter === "bandpass" ? 0.65 : 0.25;
  gain.gain.value = profile.gain;
  lfo.type = "sine";
  lfo.frequency.value = profile.rate;
  lfoGain.gain.value = profile.gain * profile.depth;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  source.start();
  lfo.start();
  nodes.push(source, lfo);
}

function scheduleBirds(context, output, timers) {
  function chirp() {
    if (context.state !== "running") return;

    [0, 0.13].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + offset;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1450 + index * 180, start);
      oscillator.frequency.exponentialRampToValueAtTime(2150 + index * 220, start + 0.1);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      oscillator.connect(gain);
      gain.connect(output);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });

    timers.push(window.setTimeout(chirp, 4800 + Math.random() * 4200));
  }

  timers.push(window.setTimeout(chirp, 1300 + Math.random() * 1700));
}

function scheduleThunder(context, output, timers) {
  function rumble() {
    if (context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(58, start);
    oscillator.frequency.exponentialRampToValueAtTime(34, start + 2.4);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.6);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(start + 2.7);

    timers.push(window.setTimeout(rumble, 9000 + Math.random() * 8000));
  }

  timers.push(window.setTimeout(rumble, 4200 + Math.random() * 2800));
}

function startSoundscape(context, sceneState, output) {
  const nodes = [];
  const timers = [];
  const profile = SOUND_PROFILES[sceneState] || SOUND_PROFILES.cloudy;

  profile.forEach((layer) => addNoiseLayer(context, output, layer, nodes));

  if (sceneState === "sunny") scheduleBirds(context, output, timers);
  if (sceneState === "stormy") scheduleThunder(context, output, timers);

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    nodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // The source may already have stopped naturally.
      }
      node.disconnect();
    });
  };
}

function AmbientSound({ sceneState }) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(readSavedVolume);
  const [unavailable, setUnavailable] = useState(false);
  const contextRef = useRef(null);
  const masterGainRef = useRef(null);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
    localStorage.setItem(STORAGE_VOLUME, String(volume));
    if (masterGainRef.current && contextRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        volume * 0.16,
        contextRef.current.currentTime,
        0.05
      );
    }
  }, [volume]);

  useEffect(() => {
    const context = contextRef.current;
    if (!enabled || !context) return undefined;

    const masterGain = context.createGain();
    masterGain.gain.value = volumeRef.current * 0.16;
    masterGain.connect(context.destination);
    masterGainRef.current = masterGain;
    const stopSoundscape = startSoundscape(context, sceneState, masterGain);

    return () => {
      stopSoundscape();
      masterGain.disconnect();
      masterGainRef.current = null;
    };
  }, [enabled, sceneState]);

  useEffect(
    () => () => {
      contextRef.current?.close();
    },
    []
  );

  async function toggleSound() {
    if (enabled) {
      setEnabled(false);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        setUnavailable(true);
        return;
      }

      if (!contextRef.current || contextRef.current.state === "closed") {
        contextRef.current = new AudioContextClass();
      }

      await contextRef.current.resume();
      setUnavailable(false);
      setEnabled(true);
    } catch {
      setUnavailable(true);
    }
  }

  const label = SOUND_LABELS[sceneState] || SOUND_LABELS.cloudy;

  return (
    <div className={`ambient-control ${enabled ? "is-playing" : ""}`}>
      <button
        className="ambient-toggle"
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? `Mute ${label.toLowerCase()}` : `Play ${label.toLowerCase()}`}
        onClick={toggleSound}
      >
        <span className="ambient-speaker" aria-hidden="true" />
        <span>{enabled ? label : "Ambient sound"}</span>
        <i aria-hidden="true" />
      </button>

      {enabled && (
        <label className="ambient-volume">
          <span className="sr-only">Ambient sound volume</span>
          <input
            type="range"
            min="0.15"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {unavailable ? "Ambient sound is unavailable in this browser." : ""}
      </span>
    </div>
  );
}

export default AmbientSound;
