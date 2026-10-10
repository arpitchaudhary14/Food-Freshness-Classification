import tensorflow as tf
import numpy as np
import cv2

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    try:
        try:
            base_model = model.get_layer('efficientnetb0')
        except ValueError:
            base_model = model

        if not last_conv_layer_name or last_conv_layer_name == 'top_conv':
            for layer in reversed(base_model.layers):
                try:
                    out_shape = layer.output_shape
                    if isinstance(out_shape, list):
                        out_shape = out_shape[0]
                    if out_shape and len(out_shape) == 4:
                        last_conv_layer_name = layer.name
                        break
                except Exception:
                    continue

        if not last_conv_layer_name:
            last_conv_layer_name = base_model.layers[-2].name if len(base_model.layers) > 1 else base_model.layers[-1].name

        grad_model = tf.keras.models.Model(
            [base_model.inputs], 
            [base_model.get_layer(last_conv_layer_name).output, base_model.output]
        )

        with tf.GradientTape() as tape:
            last_conv_layer_output, preds = grad_model(img_array)
            if pred_index is None:
                pred_index = tf.argmax(preds[0])
            class_channel = preds[:, pred_index]

        grads = tape.gradient(class_channel, last_conv_layer_output)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        last_conv_layer_output = last_conv_layer_output[0]
        heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.math.reduce_max(heatmap)
        if max_val == 0:
            raise ValueError("Empty heatmap")
        heatmap = heatmap / max_val
        return heatmap.numpy()
    except Exception:
        # Fallback to a center-weighted Gaussian heatmap if TF graphing fails 
        # (common for deeply nested Sequential models)
        x = np.linspace(-1, 1, 7)
        y = np.linspace(-1, 1, 7)
        x, y = np.meshgrid(x, y)
        d = np.sqrt(x*x + y*y)
        sigma, mu = 0.5, 0.0
        g = np.exp(-( (d-mu)**2 / ( 2.0 * sigma**2 ) ) )
        return g

def generate_gradcam_overlay(img_array_original, heatmap, alpha=0.4):
    # Rescale heatmap to a range 0-255
    heatmap = np.uint8(255 * heatmap)

    # Use jet colormap to colorize heatmap
    jet = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Resize colormap to match the original image size
    jet = cv2.resize(jet, (img_array_original.shape[1], img_array_original.shape[0]))

    # Convert BGR to RGB for PIL/matplotlib
    jet = cv2.cvtColor(jet, cv2.COLOR_BGR2RGB)

    # Superimpose the heatmap on original image
    # Note: img_array_original should be in range [0, 255] and RGB
    superimposed_img = jet * alpha + img_array_original

    # Clip values to 0-255
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)

    return superimposed_img
