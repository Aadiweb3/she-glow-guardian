/**
 * Audio preprocessing for CNN distress detection model
 * Implements exact preprocessing pipeline from metadata.json
 */

// Model preprocessing parameters
const SR = 16000; // Sampling rate
const CLIP_SAMPLES = SR * 1; // 1 second = 16000 samples
const N_MELS = 64;
const N_FFT = 512;
const HOP_LENGTH = 160;
const EXPECTED_TIMESTEPS = 97;
const LABELS = { 0: "distress", 1: "safe" };

export class AudioPreprocessor {
  /**
   * Resample audio to 16kHz mono
   */
  static async resampleTo16kHz(audioBuffer: AudioBuffer): Promise<Float32Array> {
    const offlineContext = new OfflineAudioContext(
      1, // mono
      Math.ceil(audioBuffer.duration * SR),
      SR
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const resampledBuffer = await offlineContext.startRendering();
    return resampledBuffer.getChannelData(0);
  }

  /**
   * Extract 1-second clip (16000 samples), pad or truncate as needed
   */
  static extractClip(audio: Float32Array): Float32Array {
    if (audio.length < CLIP_SAMPLES) {
      // Pad with zeros
      const padded = new Float32Array(CLIP_SAMPLES);
      padded.set(audio);
      return padded;
    } else {
      // Truncate to first 1 second
      return audio.slice(0, CLIP_SAMPLES);
    }
  }

  /**
   * Create Mel filterbank
   */
  static createMelFilterbank(
    nFft: number,
    nMels: number,
    sampleRate: number
  ): Float32Array[] {
    const melMin = 0;
    const melMax = 2595 * Math.log10(1 + sampleRate / 2 / 700);
    const melPoints = new Float32Array(nMels + 2);
    
    // Create mel-spaced points
    for (let i = 0; i < nMels + 2; i++) {
      melPoints[i] = melMin + (melMax - melMin) * i / (nMels + 1);
    }

    // Convert mel to Hz
    const hzPoints = new Float32Array(nMels + 2);
    for (let i = 0; i < nMels + 2; i++) {
      hzPoints[i] = 700 * (Math.pow(10, melPoints[i] / 2595) - 1);
    }

    // Convert Hz to FFT bin
    const fftBins = new Float32Array(nMels + 2);
    for (let i = 0; i < nMels + 2; i++) {
      fftBins[i] = Math.floor((nFft + 1) * hzPoints[i] / sampleRate);
    }

    // Create filterbank
    const filterbank: Float32Array[] = [];
    const nFftBins = Math.floor(nFft / 2) + 1;

    for (let m = 0; m < nMels; m++) {
      const filter = new Float32Array(nFftBins);
      const leftBin = fftBins[m];
      const centerBin = fftBins[m + 1];
      const rightBin = fftBins[m + 2];

      for (let k = 0; k < nFftBins; k++) {
        if (k >= leftBin && k <= centerBin) {
          filter[k] = (k - leftBin) / (centerBin - leftBin);
        } else if (k > centerBin && k <= rightBin) {
          filter[k] = (rightBin - k) / (rightBin - centerBin);
        }
      }
      filterbank.push(filter);
    }

    return filterbank;
  }

  /**
   * Compute FFT using Web Audio API-compatible approach
   */
  static computeSTFT(
    audio: Float32Array,
    nFft: number,
    hopLength: number
  ): Float32Array[] {
    const numFrames = Math.floor((audio.length - nFft) / hopLength) + 1;
    const stft: Float32Array[] = [];

    // Hanning window
    const window = new Float32Array(nFft);
    for (let i = 0; i < nFft; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (nFft - 1)));
    }

    for (let frame = 0; frame < numFrames; frame++) {
      const start = frame * hopLength;
      const frameData = new Float32Array(nFft);
      
      // Apply window
      for (let i = 0; i < nFft; i++) {
        frameData[i] = audio[start + i] * window[i];
      }

      // Compute magnitude spectrum using DFT
      const spectrum = new Float32Array(Math.floor(nFft / 2) + 1);
      for (let k = 0; k <= Math.floor(nFft / 2); k++) {
        let real = 0;
        let imag = 0;
        for (let n = 0; n < nFft; n++) {
          const angle = -2 * Math.PI * k * n / nFft;
          real += frameData[n] * Math.cos(angle);
          imag += frameData[n] * Math.sin(angle);
        }
        spectrum[k] = Math.sqrt(real * real + imag * imag);
      }
      
      stft.push(spectrum);
    }

    return stft;
  }

  /**
   * Apply Mel filterbank to power spectrogram
   */
  static applyMelFilterbank(
    powerSpec: Float32Array[],
    filterbank: Float32Array[]
  ): number[][] {
    const nFrames = powerSpec.length;
    const nMels = filterbank.length;
    const melSpec: number[][] = [];

    for (let t = 0; t < nFrames; t++) {
      const melFrame: number[] = [];
      for (let m = 0; m < nMels; m++) {
        let sum = 0;
        for (let k = 0; k < powerSpec[t].length; k++) {
          sum += powerSpec[t][k] * filterbank[m][k];
        }
        melFrame.push(sum);
      }
      melSpec.push(melFrame);
    }

    return melSpec;
  }

  /**
   * Convert power to dB scale
   */
  static powerToDb(melSpec: number[][]): number[][] {
    const refValue = Math.max(...melSpec.flat());
    return melSpec.map(frame =>
      frame.map(val => {
        const db = 10 * Math.log10(Math.max(val, 1e-10));
        return db - 10 * Math.log10(Math.max(refValue, 1e-10));
      })
    );
  }

  /**
   * Normalize per-sample: (x - mean) / (std + 1e-6)
   */
  static normalize(logMel: number[][]): number[][] {
    const flat = logMel.flat();
    const mean = flat.reduce((a, b) => a + b, 0) / flat.length;
    const variance = flat.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / flat.length;
    const std = Math.sqrt(variance);

    return logMel.map(frame =>
      frame.map(val => (val - mean) / (std + 1e-6))
    );
  }

  /**
   * Pad or truncate to expected timesteps (97 frames)
   */
  static fixTimeSteps(logMel: number[][]): number[][] {
    const nFrames = logMel.length;
    
    if (nFrames < EXPECTED_TIMESTEPS) {
      // Pad with zeros
      const padded = [...logMel];
      for (let i = nFrames; i < EXPECTED_TIMESTEPS; i++) {
        padded.push(new Array(N_MELS).fill(0));
      }
      return padded;
    } else {
      // Truncate
      return logMel.slice(0, EXPECTED_TIMESTEPS);
    }
  }

  /**
   * Main preprocessing pipeline
   * Returns shape: (64, 97) ready for model input
   */
  static async preprocessAudio(audioBlob: Blob): Promise<number[][]> {
    // Decode audio blob
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Step 1: Resample to 16kHz mono
    const resampled = await this.resampleTo16kHz(audioBuffer);

    // Step 2: Extract 1-second clip
    const clip = this.extractClip(resampled);

    // Step 3: Compute STFT
    const stft = this.computeSTFT(clip, N_FFT, HOP_LENGTH);

    // Step 4: Compute power spectrogram (power = 2.0)
    const powerSpec = stft.map(frame =>
      Float32Array.from(frame.map(val => val * val))
    );

    // Step 5: Apply Mel filterbank
    const filterbank = this.createMelFilterbank(N_FFT, N_MELS, SR);
    const melSpec = this.applyMelFilterbank(powerSpec, filterbank);

    // Step 6: Convert to dB scale
    const logMel = this.powerToDb(melSpec);

    // Step 7: Normalize
    const normalized = this.normalize(logMel);

    // Step 8: Fix timesteps to 97
    const fixed = this.fixTimeSteps(normalized);

    // Transpose to (64, 97) - mel bins x time frames
    const transposed: number[][] = [];
    for (let m = 0; m < N_MELS; m++) {
      const melRow: number[] = [];
      for (let t = 0; t < EXPECTED_TIMESTEPS; t++) {
        melRow.push(fixed[t][m]);
      }
      transposed.push(melRow);
    }

    return transposed;
  }

  /**
   * Convert preprocessed data to model input tensor shape (64, 97, 1)
   * Note: Batch dimension will be added by TensorFlow.js
   */
  static toModelInput(logMel: number[][]): number[][][] {
    return logMel.map(row => row.map(val => [val]));
  }

  static getLabels() {
    return LABELS;
  }

  static getConfig() {
    return {
      SR,
      CLIP_SAMPLES,
      N_MELS,
      N_FFT,
      HOP_LENGTH,
      EXPECTED_TIMESTEPS
    };
  }
}
