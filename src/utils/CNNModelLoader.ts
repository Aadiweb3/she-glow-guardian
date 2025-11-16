/**
 * CNN Model Loader for TensorFlow.js
 * Will load the converted TF-JS model once provided
 */

import * as tf from '@tensorflow/tfjs';
import { AudioPreprocessor } from './AudioPreprocessor';

export class CNNModelLoader {
  private static model: tf.LayersModel | null = null;
  private static isLoading = false;
  private static readonly HIGH_RECALL_THRESHOLD = 0.5456; // from thresholds.json

  /**
   * Load the TensorFlow.js model
   * @param modelPath Path to model.json file
   */
  static async loadModel(modelPath: string): Promise<void> {
    if (this.model || this.isLoading) {
      console.log("Model already loaded or loading");
      return;
    }

    this.isLoading = true;
    console.log("Loading CNN model from:", modelPath);

    try {
      this.model = await tf.loadLayersModel(modelPath);
      console.log("CNN model loaded successfully");
      console.log("Model input shape:", this.model.inputs[0].shape);
      console.log("Model output shape:", this.model.outputs[0].shape);
    } catch (error) {
      console.error("Failed to load CNN model:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Check if model is loaded
   */
  static isModelLoaded(): boolean {
    return this.model !== null;
  }

  /**
   * Predict distress from audio blob
   * @param audioBlob Audio blob to analyze
   * @returns Prediction result with probabilities
   */
  static async predict(audioBlob: Blob): Promise<{
    distress_detected: boolean;
    confidence: number;
    prob_distress: number;
    prob_safe: number;
    reason: string;
    recommended_action: "alert" | "monitor" | "safe";
  }> {
    if (!this.model) {
      throw new Error("Model not loaded. Call loadModel() first.");
    }

    // Step 1: Preprocess audio to (64, 97) log-mel spectrogram
    console.log("Preprocessing audio...");
    const logMel = await AudioPreprocessor.preprocessAudio(audioBlob);

    // Step 2: Convert to tensor shape (1, 64, 97, 1)
    const modelInput = AudioPreprocessor.toModelInput(logMel);
    const inputTensor = tf.tensor4d([modelInput]);
    
    console.log("Input tensor shape:", inputTensor.shape);

    // Step 3: Run inference
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.data();
    
    const probDistress = probabilities[0];
    const probSafe = probabilities[1];

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    // Step 4: Apply high-recall threshold
    const distressDetected = probDistress >= this.HIGH_RECALL_THRESHOLD;

    console.log(`Prediction: distress=${probDistress.toFixed(4)}, safe=${probSafe.toFixed(4)}`);
    console.log(`Threshold: ${this.HIGH_RECALL_THRESHOLD}, Triggered: ${distressDetected}`);

    return {
      distress_detected: distressDetected,
      confidence: probDistress,
      prob_distress: probDistress,
      prob_safe: probSafe,
      reason: distressDetected 
        ? `High distress probability detected (${(probDistress * 100).toFixed(1)}%)`
        : `Audio classified as safe (${(probSafe * 100).toFixed(1)}% safe)`,
      recommended_action: distressDetected ? "alert" : probDistress > 0.3 ? "monitor" : "safe"
    };
  }

  /**
   * Unload model to free memory
   */
  static unloadModel(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log("CNN model unloaded");
    }
  }
}
