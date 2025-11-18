# TensorFlow.js Model Files

## CNN Distress Detection Model

This directory should contain the TensorFlow.js converted model files for the audio distress detection CNN.

### Required Files

Place your converted TensorFlow.js model files in `public/models/tfjs_model/`:

```
public/models/tfjs_model/
├── model.json
├── group1-shard1of*.bin
├── group1-shard2of*.bin
└── ... (all weight shard files)
```

### Model Specifications

- **Input Shape**: (1, 97, 64, 1) - Mel spectrogram with 97 time steps and 64 mel bands
- **Output**: Binary classification (distress probability, safe probability)
- **Preprocessing**: 16kHz audio, 1-second clips
- **Threshold**: High recall threshold of 0.5396 for distress detection

### Loading the Model

The model is automatically loaded when safety monitoring starts. The path is configured in `CNNModelLoader.ts` as:

```typescript
await CNNModelLoader.loadModel('/models/tfjs_model/model.json');
```

### Conversion Instructions

If you need to convert a Keras model to TensorFlow.js format:

```bash
tensorflowjs_converter \
  --input_format keras \
  path/to/your_model.h5 \
  public/models/tfjs_model/
```

Or using Python:

```python
import tensorflowjs as tfjs
model = tf.keras.models.load_model('your_model.h5')
tfjs.converters.save_keras_model(model, 'public/models/tfjs_model')
```

### Verification

Once files are in place, open the browser console and look for:

```
Loading CNN model from: /models/tfjs_model/model.json
CNN model loaded successfully
Model input shape: [null, 97, 64, 1]
Model output shape: [null, 2]
```
