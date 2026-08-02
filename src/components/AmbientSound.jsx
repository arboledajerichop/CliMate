import { useEffect, useRef, useState } from "react";

const STORAGE_VOLUME = "climate-ambient-volume";
const MASTER_LEVEL = 0.58;

const SOUND_PROFILES = {
  drizzle: [
    { color: "white", filter: "highpass", frequency: 1850, gain: 0.105, rate: 0.04, depth: 0.12, x: -1.8, z: -5, drift: 1.8, wet: 0.3 },
    { color: "white", filter: "bandpass", frequency: 3400, gain: 0.032, rate: 0.08, depth: 0.22, x: 2, z: -7, drift: 2.2, wet: 0.4, q: 0.9 },
  ],
  sunny: [
    { color: "brown", filter: "lowpass", frequency: 1250, gain: 0.14, rate: 0.075, depth: 0.24, x: -1.5, z: -4, drift: 2.4, wet: 0.12 },
    { color: "white", filter: "bandpass", frequency: 2800, gain: 0.035, rate: 0.14, depth: 0.32, x: 2, z: -7, drift: 1.4, wet: 0.18 },
  ],
  cloudy: [
    { color: "brown", filter: "lowpass", frequency: 930, gain: 0.17, rate: 0.055, depth: 0.24, x: -1, z: -5, drift: 2.8, wet: 0.16 },
    { color: "white", filter: "bandpass", frequency: 1900, gain: 0.04, rate: 0.09, depth: 0.3, x: 2.5, z: -8, drift: 1.8, wet: 0.2 },
  ],
  windy: [
    { color: "brown", filter: "bandpass", frequency: 480, gain: 0.34, rate: 0.12, depth: 0.55, x: -2.5, z: -5, drift: 4.2, wet: 0.22, q: 0.75 },
    { color: "white", filter: "lowpass", frequency: 2200, gain: 0.15, rate: 0.18, depth: 0.5, x: 2.5, z: -7, drift: 4.8, wet: 0.18 },
  ],
  rainy: [
    { color: "white", filter: "highpass", frequency: 1050, gain: 0.27, rate: 0.045, depth: 0.16, x: -2.2, z: -4, drift: 2.5, wet: 0.32 },
    { color: "brown", filter: "lowpass", frequency: 680, gain: 0.17, rate: 0.075, depth: 0.22, x: 2.2, z: -3, drift: 2, wet: 0.28 },
    { color: "white", filter: "bandpass", frequency: 3100, gain: 0.065, rate: 0.11, depth: 0.3, x: 0, z: -8, drift: 3.5, wet: 0.42 },
  ],
  stormy: [
    { color: "white", filter: "highpass", frequency: 760, gain: 0.34, rate: 0.065, depth: 0.24, x: -2.8, z: -4, drift: 4.6, wet: 0.34 },
    { color: "brown", filter: "lowpass", frequency: 520, gain: 0.27, rate: 0.105, depth: 0.4, x: 2.8, z: -5, drift: 4.4, wet: 0.3 },
    { color: "white", filter: "bandpass", frequency: 2600, gain: 0.08, rate: 0.14, depth: 0.4, x: 0, z: -8, drift: 5.2, wet: 0.45 },
  ],
  snowy: [
    { color: "brown", filter: "lowpass", frequency: 720, gain: 0.105, rate: 0.04, depth: 0.2, x: -1.5, z: -8, drift: 2.4, wet: 0.38 },
    { color: "white", filter: "bandpass", frequency: 1500, gain: 0.025, rate: 0.07, depth: 0.3, x: 2, z: -10, drift: 2, wet: 0.48 },
  ],
};

function getRainAudio(weatherCode, sceneState) {
  const code = Number(weatherCode);

  if ([95, 96, 99].includes(code) || sceneState === "stormy") {
    return { kind: "storm", bedScale: 1, drops: "heavy" };
  }
  if ([51, 56].includes(code)) {
    return { kind: "drizzle", bedScale: 0.72, drops: "drizzle" };
  }
  if ([53, 57].includes(code)) {
    return { kind: "drizzle", bedScale: 0.88, drops: "drizzle" };
  }
  if (code === 55) {
    return { kind: "drizzle", bedScale: 1, drops: "light" };
  }
  if ([61, 80].includes(code)) {
    return { kind: "rain", bedScale: 0.62, drops: "light" };
  }
  if ([63, 81].includes(code)) {
    return { kind: "rain", bedScale: 0.82, drops: "steady" };
  }
  if ([65, 66, 67, 82].includes(code)) {
    return { kind: "rain", bedScale: 1.08, drops: "heavy" };
  }
  if (sceneState === "rainy") {
    return { kind: "rain", bedScale: 0.62, drops: "light" };
  }
  return { kind: "none", bedScale: 1, drops: "none" };
}

function getSoundscapeDetails(sceneState, dayPeriod, weatherCode) {
  const isNight = dayPeriod === "night";
  const rainAudio = getRainAudio(weatherCode, sceneState);

  if (rainAudio.kind === "storm") {
    return {
      label: isNight ? "Storm after dark" : "Storm in motion",
      details: isNight
        ? "3D rain · frogs · owl · thunder"
        : "3D rain · moving wind · thunder",
    };
  }
  if (rainAudio.kind === "drizzle") {
    return {
      label: isNight ? "Soft drizzle at night" : "Light drizzle",
      details: isNight
        ? "Soft 3D drizzle · frogs · crickets · owl"
        : "Soft 3D drizzle · leaves · gentle drops",
    };
  }
  if (rainAudio.kind === "rain") {
    return {
      label: isNight ? "Rainforest at night" : "Rain all around",
      details: isNight
        ? "3D rain · frogs · crickets · owl"
        : "3D rain · puddles · dripping leaves",
    };
  }
  if (sceneState === "windy") {
    return {
      label: isNight ? "Windy night" : "Wind through the trees",
      details: isNight
        ? "3D gusts · leaves · night wildlife"
        : "3D gusts · grass · rustling canopy",
    };
  }
  if (sceneState === "snowy") {
    return {
      label: isNight ? "Winter night" : "Winter hush",
      details: "3D soft wind · distant branches",
    };
  }
  if (isNight) {
    return {
      label: "Night chorus",
      details: "3D crickets · owl · soft grass",
    };
  }
  if (sceneState === "sunny") {
    return {
      label: dayPeriod === "morning" ? "Morning meadow" : "Sunny outdoors",
      details: dayPeriod === "sunset"
        ? "3D breeze · cicadas · evening birds"
        : "3D birdsong · grass · warm breeze",
    };
  }
  return {
    label: dayPeriod === "sunset" ? "Evening outdoors" : "Cloudy outdoors",
    details: "3D distant birds · grass · soft leaves",
  };
}

function readSavedVolume() {
  const saved = Number.parseFloat(localStorage.getItem(STORAGE_VOLUME));
  return Number.isFinite(saved) ? Math.min(1, Math.max(0.2, saved)) : 0.76;
}

function makeNoiseBuffer(context, color, duration = 4) {
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * duration),
    context.sampleRate
  );
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

function makeReverbImpulse(context, duration = 1.8, decay = 2.8) {
  const length = Math.ceil(context.sampleRate * duration);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const samples = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const envelope = (1 - index / length) ** decay;
      samples[index] = (Math.random() * 2 - 1) * envelope;
    }
  }

  return impulse;
}

function createTimerQueue() {
  const timers = new Set();

  return {
    later(callback, delay) {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    },
    clear() {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    },
  };
}

function positionPanner(panner, x, y = 0, z = -2) {
  if (panner.positionX) {
    panner.positionX.value = x;
    panner.positionY.value = y;
    panner.positionZ.value = z;
  } else {
    panner.setPosition(x, y, z);
  }
}

function createPanner(context, { x = 0, y = 0, z = -2 } = {}) {
  const panner = context.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "inverse";
  panner.refDistance = 1;
  panner.maxDistance = 24;
  panner.rolloffFactor = 0.45;
  positionPanner(panner, x, y, z);
  return panner;
}

function createSoundStage(context, output) {
  const sceneGain = context.createGain();
  const dryBus = context.createGain();
  const wetBus = context.createGain();
  const convolver = context.createConvolver();
  const reverbGain = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const start = context.currentTime;

  convolver.buffer = makeReverbImpulse(context);
  dryBus.gain.value = 0.96;
  wetBus.gain.value = 1;
  reverbGain.gain.value = 0.28;
  compressor.threshold.value = -21;
  compressor.knee.value = 18;
  compressor.ratio.value = 7;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.34;
  sceneGain.gain.setValueAtTime(0, start);
  sceneGain.gain.linearRampToValueAtTime(1, start + 0.38);

  dryBus.connect(compressor);
  wetBus.connect(convolver);
  convolver.connect(reverbGain);
  reverbGain.connect(compressor);
  compressor.connect(sceneGain);
  sceneGain.connect(output);

  return { compressor, convolver, dryBus, reverbGain, sceneGain, wetBus };
}

function connectSpatial(context, node, stage, {
  x = 0,
  y = 0,
  z = -2,
  wet = 0.18,
} = {}) {
  const panner = createPanner(context, { x, y, z });
  const reverbSend = context.createGain();
  reverbSend.gain.value = wet;
  node.connect(panner);
  panner.connect(stage.dryBus);
  panner.connect(reverbSend);
  reverbSend.connect(stage.wetBus);
  return { panner, reverbSend };
}

function animatePanner(context, panner, amount, rate, persistentNodes) {
  if (!panner.positionX || !amount) return;
  const motion = context.createOscillator();
  const motionDepth = context.createGain();
  motion.type = "sine";
  motion.frequency.value = rate;
  motionDepth.gain.value = amount;
  motion.connect(motionDepth);
  motionDepth.connect(panner.positionX);
  motion.start();
  persistentNodes.push(motion);
}

function addNoiseLayer(context, stage, profile, persistentNodes) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();

  source.buffer = makeNoiseBuffer(context, profile.color);
  source.loop = true;
  filter.type = profile.filter;
  filter.frequency.value = profile.frequency;
  filter.Q.value = profile.q ?? (profile.filter === "bandpass" ? 0.7 : 0.25);
  gain.gain.value = profile.gain;
  lfo.type = "sine";
  lfo.frequency.value = profile.rate;
  lfoGain.gain.value = profile.gain * profile.depth;

  source.connect(filter);
  filter.connect(gain);
  const { panner } = connectSpatial(context, gain, stage, profile);
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  animatePanner(context, panner, profile.drift, profile.rate * 0.72, persistentNodes);

  source.start();
  lfo.start();
  persistentNodes.push(source, lfo);
}

function cleanOneShot(source, nodes) {
  source.onended = () => {
    nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // A browser may have already disconnected a finished one-shot node.
      }
    });
  };
}

function playTone(context, stage, {
  start = context.currentTime,
  duration = 0.2,
  frequency = 1200,
  endFrequency = frequency,
  gain = 0.05,
  type = "sine",
  x = 0,
  y = 0,
  z = -2,
  wet = 0.2,
}) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20, endFrequency),
    start + duration
  );
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(
    gain,
    start + Math.min(0.05, duration * 0.24)
  );
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  const spatial = connectSpatial(context, envelope, stage, { x, y, z, wet });
  cleanOneShot(oscillator, [oscillator, envelope, spatial.panner, spatial.reverbSend]);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function playNoiseBurst(context, stage, {
  start = context.currentTime,
  duration = 0.8,
  frequency = 1800,
  endFrequency = frequency,
  gain = 0.09,
  filterType = "bandpass",
  q = 0.8,
  x = 0,
  endX = x,
  y = 0,
  z = -2,
  wet = 0.2,
} = {}) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = makeNoiseBuffer(context, "white", duration + 0.12);
  filter.type = filterType;
  filter.frequency.setValueAtTime(Math.max(20, frequency), start);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(20, endFrequency),
    start + duration
  );
  filter.Q.value = q;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + duration * 0.2);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(envelope);
  const spatial = connectSpatial(context, envelope, stage, { x, y, z, wet });
  if (spatial.panner.positionX && endX !== x) {
    spatial.panner.positionX.linearRampToValueAtTime(endX, start + duration);
  }
  cleanOneShot(source, [source, filter, envelope, spatial.panner, spatial.reverbSend]);
  source.start(start);
  source.stop(start + duration + 0.03);
}

function scheduleBirds(context, stage, queue, { cloudy = false, evening = false } = {}) {
  function chirp() {
    if (context.state !== "running") {
      queue.later(chirp, 1200);
      return;
    }

    const start = context.currentTime;
    const x = -4 + Math.random() * 8;
    const notes = evening ? [1180, 1450] : cloudy ? [1320, 1580] : [1450, 1810, 1640];
    notes.forEach((frequency, index) => {
      playTone(context, stage, {
        start: start + index * 0.13,
        duration: 0.17,
        frequency,
        endFrequency: frequency + (evening ? 420 : 650),
        gain: evening ? 0.072 : cloudy ? 0.062 : 0.085,
        x,
        y: 2.5,
        z: -4 - Math.random() * 4,
        wet: 0.3,
      });
    });
    queue.later(chirp, (evening ? 6700 : cloudy ? 6100 : 3900) + Math.random() * 4200);
  }

  queue.later(chirp, 650 + Math.random() * 1300);
}

function playCricketPhrase(context, stage, x = -2.5) {
  const start = context.currentTime;
  for (let pulse = 0; pulse < 6; pulse += 1) {
    playTone(context, stage, {
      start: start + pulse * 0.1,
      duration: 0.058,
      frequency: 3750 + (pulse % 2) * 300,
      endFrequency: 4250 + (pulse % 2) * 180,
      gain: 0.078,
      type: "triangle",
      x,
      y: -0.4,
      z: -2.8,
      wet: 0.2,
    });
  }
}

function playOwlCall(context, stage, x = 3.5) {
  const start = context.currentTime;
  [0, 0.76].forEach((offset, index) => {
    playTone(context, stage, {
      start: start + offset,
      duration: index === 0 ? 0.52 : 0.68,
      frequency: index === 0 ? 510 : 455,
      endFrequency: index === 0 ? 335 : 295,
      gain: 0.2,
      x,
      y: 2.8,
      z: -7,
      wet: 0.5,
    });
    playTone(context, stage, {
      start: start + offset,
      duration: index === 0 ? 0.54 : 0.7,
      frequency: index === 0 ? 255 : 228,
      endFrequency: index === 0 ? 176 : 158,
      gain: 0.075,
      type: "triangle",
      x,
      y: 2.8,
      z: -7,
      wet: 0.52,
    });
  });
}

function playFrogCall(context, stage, x = -1) {
  const start = context.currentTime;
  [0, 0.38].forEach((offset, index) => {
    playTone(context, stage, {
      start: start + offset,
      duration: 0.28 + index * 0.04,
      frequency: 205 - index * 18,
      endFrequency: 112 - index * 8,
      gain: 0.25,
      type: "triangle",
      x,
      y: -0.8,
      z: -2.2,
      wet: 0.3,
    });
    playTone(context, stage, {
      start: start + offset,
      duration: 0.24 + index * 0.04,
      frequency: 330 - index * 24,
      endFrequency: 175 - index * 12,
      gain: 0.115,
      type: "sine",
      x,
      y: -0.8,
      z: -2.2,
      wet: 0.32,
    });
    playNoiseBurst(context, stage, {
      start: start + offset,
      duration: 0.23 + index * 0.03,
      frequency: 520,
      endFrequency: 245,
      gain: 0.12,
      filterType: "bandpass",
      q: 3.6,
      x,
      y: -0.8,
      z: -2.2,
      wet: 0.25,
    });
  });
}

function scheduleNightWildlife(context, stage, queue, rainy = false) {
  const calls = rainy ? ["frog", "cricket", "owl"] : ["cricket", "owl"];
  let callIndex = rainy ? 0 : Math.floor(Math.random() * calls.length);

  function playNext() {
    if (context.state !== "running") {
      queue.later(playNext, 1200);
      return;
    }

    const call = calls[callIndex];
    const x = -4 + Math.random() * 8;
    if (call === "frog") playFrogCall(context, stage, x);
    if (call === "cricket") playCricketPhrase(context, stage, x);
    if (call === "owl") playOwlCall(context, stage, x);
    callIndex = (callIndex + 1) % calls.length;

    const baseDelay = call === "owl" ? 2800 : call === "frog" ? 2200 : 2400;
    queue.later(playNext, baseDelay + Math.random() * (call === "owl" ? 1100 : 850));
  }

  queue.later(playNext, 220 + Math.random() * 380);
}

function scheduleLeafRustle(context, stage, queue, intensity = "soft") {
  function rustle() {
    if (context.state !== "running") {
      queue.later(rustle, 1000);
      return;
    }

    const strong = intensity === "strong";
    const x = -4.5 + Math.random() * 9;
    playNoiseBurst(context, stage, {
      duration: strong ? 1.3 + Math.random() * 0.7 : 0.75 + Math.random() * 0.6,
      frequency: strong ? 1250 : 2050,
      endFrequency: strong ? 2300 : 3100,
      gain: strong ? 0.2 : 0.115,
      q: strong ? 0.75 : 1.05,
      x,
      endX: x + (Math.random() > 0.5 ? 2.2 : -2.2),
      y: strong ? 1.2 : -0.4,
      z: strong ? -3.5 : -5,
      wet: strong ? 0.24 : 0.18,
    });
    queue.later(rustle, (strong ? 1500 : 3100) + Math.random() * 2600);
  }

  queue.later(rustle, 500 + Math.random() * 800);
}

function scheduleWaterDrops(context, stage, queue, intensity = "steady") {
  function drop() {
    if (context.state !== "running") {
      queue.later(drop, 900);
      return;
    }

    const start = context.currentTime;
    const x = -4 + Math.random() * 8;
    const isDrizzle = intensity === "drizzle";
    const isHeavy = intensity === "heavy";
    playTone(context, stage, {
      start,
      duration: isDrizzle ? 0.09 : 0.13,
      frequency: (isDrizzle ? 1450 : 1050) + Math.random() * 650,
      endFrequency: (isDrizzle ? 760 : 480) + Math.random() * 160,
      gain: isDrizzle ? 0.026 : isHeavy ? 0.057 : 0.041,
      x,
      y: 1.5,
      z: -1.5 - Math.random() * 4,
      wet: 0.38,
    });
    if (!isDrizzle && Math.random() > 0.52) {
      playTone(context, stage, {
        start: start + 0.15,
        duration: 0.1,
        frequency: 860,
        endFrequency: 430,
        gain: isHeavy ? 0.04 : 0.03,
        x: x + 0.5,
        y: -0.6,
        z: -2,
        wet: 0.3,
      });
    }
    const baseDelay = isDrizzle ? 1250 : isHeavy ? 420 : intensity === "light" ? 920 : 700;
    const randomDelay = isDrizzle ? 1900 : isHeavy ? 850 : intensity === "light" ? 1500 : 1250;
    queue.later(drop, baseDelay + Math.random() * randomDelay);
  }

  queue.later(drop, 180 + Math.random() * 420);
}

function scheduleWindGusts(context, stage, queue, stormy = false) {
  function gust() {
    if (context.state !== "running") {
      queue.later(gust, 1000);
      return;
    }

    const fromLeft = Math.random() > 0.5;
    const x = fromLeft ? -5 : 5;
    const duration = (stormy ? 2.7 : 2.1) + Math.random() * 1.6;
    playNoiseBurst(context, stage, {
      duration,
      frequency: stormy ? 260 : 330,
      endFrequency: stormy ? 720 : 560,
      gain: stormy ? 0.27 : 0.21,
      filterType: "bandpass",
      q: stormy ? 2.8 : 3.8,
      x,
      endX: -x,
      y: 1.2,
      z: -4.5,
      wet: 0.34,
    });
    queue.later(gust, (stormy ? 2300 : 3400) + Math.random() * 3200);
  }

  queue.later(gust, 600 + Math.random() * 900);
}

function scheduleThunder(context, stage, queue) {
  function rumble() {
    if (context.state !== "running") {
      queue.later(rumble, 1600);
      return;
    }

    const start = context.currentTime;
    const x = -4 + Math.random() * 8;
    playTone(context, stage, {
      start,
      duration: 3.2,
      frequency: 67,
      endFrequency: 29,
      gain: 0.29,
      x,
      y: 3,
      z: -8,
      wet: 0.56,
    });
    playNoiseBurst(context, stage, {
      duration: 2.8,
      frequency: 360,
      endFrequency: 105,
      gain: 0.19,
      filterType: "lowpass",
      q: 0.45,
      x,
      endX: x * -0.35,
      y: 2.5,
      z: -7,
      wet: 0.48,
    });
    queue.later(rumble, 8500 + Math.random() * 9000);
  }

  queue.later(rumble, 2500 + Math.random() * 2600);
}

function scheduleWinterBranches(context, stage, queue) {
  function creak() {
    if (context.state !== "running") {
      queue.later(creak, 1400);
      return;
    }

    const x = -4 + Math.random() * 8;
    playNoiseBurst(context, stage, {
      duration: 1.2,
      frequency: 680,
      endFrequency: 260,
      gain: 0.075,
      q: 3.2,
      x,
      y: 2,
      z: -8,
      wet: 0.55,
    });
    queue.later(creak, 7800 + Math.random() * 6200);
  }

  queue.later(creak, 2600 + Math.random() * 2500);
}

function startSoundscape(context, sceneState, dayPeriod, weatherCode, output) {
  const persistentNodes = [];
  const queue = createTimerQueue();
  const stage = createSoundStage(context, output);
  const rainAudio = getRainAudio(weatherCode, sceneState);
  const profileKey = rainAudio.kind === "drizzle" ? "drizzle" : sceneState;
  const profile = SOUND_PROFILES[profileKey] || SOUND_PROFILES.cloudy;
  const isNight = dayPeriod === "night";
  const isSunset = dayPeriod === "sunset";

  profile.forEach((layer) =>
    addNoiseLayer(
      context,
      stage,
      rainAudio.kind === "rain"
        ? { ...layer, gain: layer.gain * rainAudio.bedScale }
        : rainAudio.kind === "drizzle"
          ? { ...layer, gain: layer.gain * rainAudio.bedScale }
          : layer,
      persistentNodes
    )
  );

  if (!isNight && ["sunny", "cloudy"].includes(sceneState)) {
    scheduleBirds(context, stage, queue, {
      cloudy: sceneState === "cloudy",
      evening: isSunset,
    });
    scheduleLeafRustle(context, stage, queue, "soft");
  }

  if (isNight && sceneState !== "snowy") {
    scheduleNightWildlife(
      context,
      stage,
      queue,
      rainAudio.kind !== "none"
    );
    if (!["windy", "stormy"].includes(sceneState)) {
      scheduleLeafRustle(context, stage, queue, "soft");
    }
  }

  if (["windy", "stormy"].includes(sceneState)) {
    scheduleLeafRustle(context, stage, queue, "strong");
    scheduleWindGusts(context, stage, queue, sceneState === "stormy");
  }
  if (rainAudio.kind !== "none") {
    scheduleWaterDrops(context, stage, queue, rainAudio.drops);
  }
  if (rainAudio.kind === "storm") scheduleThunder(context, stage, queue);
  if (sceneState === "snowy") scheduleWinterBranches(context, stage, queue);

  return () => {
    queue.clear();
    const now = context.currentTime;
    try {
      stage.sceneGain.gain.cancelScheduledValues(now);
      stage.sceneGain.gain.setValueAtTime(
        Math.max(0.0001, stage.sceneGain.gain.value),
        now
      );
      stage.sceneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    } catch {
      // The audio context may already be closing during page teardown.
    }

    window.setTimeout(() => {
      persistentNodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // A scheduled source may already have ended.
        }
        try {
          node.disconnect();
        } catch {
          // A browser may already have disconnected it.
        }
      });
      [
        stage.dryBus,
        stage.wetBus,
        stage.convolver,
        stage.reverbGain,
        stage.compressor,
        stage.sceneGain,
      ].forEach((node) => {
        try {
          node.disconnect();
        } catch {
          // Ignore nodes already released by the browser.
        }
      });
    }, 760);
  };
}

function createMasterGraph(context, volume) {
  const limiter = context.createDynamicsCompressor();
  const masterGain = context.createGain();
  limiter.threshold.value = -12;
  limiter.knee.value = 8;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.24;
  masterGain.gain.value = volume * MASTER_LEVEL;
  limiter.connect(masterGain);
  masterGain.connect(context.destination);
  return { input: limiter, limiter, masterGain };
}

function AmbientSound({ sceneState, dayPeriod = "day", weatherCode }) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(readSavedVolume);
  const [unavailable, setUnavailable] = useState(false);
  const contextRef = useRef(null);
  const graphRef = useRef(null);
  const volumeRef = useRef(volume);
  const soundscape = getSoundscapeDetails(sceneState, dayPeriod, weatherCode);

  useEffect(() => {
    volumeRef.current = volume;
    localStorage.setItem(STORAGE_VOLUME, String(volume));
    const context = contextRef.current;
    const masterGain = graphRef.current?.masterGain;
    if (masterGain && context) {
      masterGain.gain.setTargetAtTime(
        volume * MASTER_LEVEL,
        context.currentTime,
        0.08
      );
    }
  }, [volume]);

  useEffect(() => {
    const context = contextRef.current;
    const graph = graphRef.current;
    if (!enabled || !context || !graph) return undefined;
    return startSoundscape(context, sceneState, dayPeriod, weatherCode, graph.input);
  }, [dayPeriod, enabled, sceneState, weatherCode]);

  useEffect(
    () => () => {
      try {
        graphRef.current?.limiter.disconnect();
        graphRef.current?.masterGain.disconnect();
      } catch {
        // The nodes may already be released during browser teardown.
      }
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
        graphRef.current = createMasterGraph(contextRef.current, volumeRef.current);
      }

      await contextRef.current.resume();
      setUnavailable(false);
      setEnabled(true);
    } catch {
      setUnavailable(true);
    }
  }

  return (
    <div className={`ambient-control ${enabled ? "is-playing" : ""}`}>
      <button
        className="ambient-toggle"
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? `Mute ${soundscape.label.toLowerCase()}` : `Play ${soundscape.label.toLowerCase()}`}
        onClick={toggleSound}
      >
        <span className="ambient-speaker" aria-hidden="true" />
        <span className="ambient-copy">
          <strong>{enabled ? soundscape.label : "3D soundscape"}</strong>
          <small>{enabled ? soundscape.details : "Tap to enter this scene"}</small>
        </span>
        <i aria-hidden="true" />
      </button>

      {enabled && (
        <label className="ambient-volume">
          <span className="sr-only">Immersive sound volume</span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={volume}
            aria-valuetext={`${Math.round(volume * 100)} percent`}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
          <output aria-hidden="true">{Math.round(volume * 100)}%</output>
        </label>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {unavailable ? "Immersive sound is unavailable in this browser." : ""}
      </span>
    </div>
  );
}

export default AmbientSound;
