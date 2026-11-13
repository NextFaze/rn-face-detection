package com.margelo.nitro.rnfacedetection

import android.graphics.RectF
import android.util.Log
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facedetector.FaceDetector
import com.google.mediapipe.tasks.vision.facedetector.FaceDetectorResult
import com.margelo.nitro.NitroModules
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.extensions.toBitmap
import com.margelo.nitro.camera.public.NativeFrame

@Suppress("unused")
@Keep
@DoNotStrip
class HybridFaceDetection : HybridFaceDetectionSpec() {
  private var faceDetector: FaceDetector? = null
  private var lastTimestampMs: Long = -1

  private fun getFaceDetector(): FaceDetector {
    faceDetector?.let { return it }

    val context =
      NitroModules.applicationContext
        ?: throw Error("[rn-face-detection] ApplicationContext is not available")

    val options =
      FaceDetector.FaceDetectorOptions.builder()
        .setBaseOptions(
          BaseOptions.builder()
            .setModelAssetPath(MODEL_ASSET_PATH)
            .build()
        )
        .setRunningMode(RunningMode.VIDEO)
        .setMinDetectionConfidence(0.8f)
        .setMinSuppressionThreshold(0.5f)
        .build()

    val detector = FaceDetector.createFromOptions(context, options)
    faceDetector = detector
    Log.i(TAG, "Created FaceDetector with model asset $MODEL_ASSET_PATH")
    return detector
  }

  override fun call(frame: HybridFrameSpec): Array<DetectedFace> {
    val nativeFrame = frame as? NativeFrame
    if (nativeFrame == null) {
      Log.w(TAG, "Frame cast to NativeFrame failed")
      return emptyArray()
    }

    val bitmap = nativeFrame.image.toBitmap(frame.orientation, frame.isMirrored)
    try {
      val mpImage = BitmapImageBuilder(bitmap).build()
      val timestampMs = nextTimestampMs(nativeFrame.image.imageInfo.timestamp)
      val result: FaceDetectorResult =
        getFaceDetector().detectForVideo(mpImage, timestampMs)
      return mapDetections(result)
    } catch (error: Exception) {
      Log.e(TAG, "Detection error: ${error.message}", error)
      throw error
    } finally {
      bitmap.recycle()
    }
  }

  private fun nextTimestampMs(imageTimestampNs: Long): Long {
    val fromImage = if (imageTimestampNs > 0) imageTimestampNs / 1_000_000L else 0L
    val next = maxOf(fromImage, lastTimestampMs + 1)
    lastTimestampMs = next
    return next
  }

  private fun mapDetections(result: FaceDetectorResult): Array<DetectedFace> {
    return result.detections().map { detection ->
      val box: RectF = detection.boundingBox()
      val keypoints =
        detection.keypoints()
          .orElse(emptyList())
          .map { keypoint ->
            Keypoint(
              x = keypoint.x().toDouble(),
              y = keypoint.y().toDouble(),
            )
          }
          .toTypedArray()

      DetectedFace(
        boundingBox =
          BoundingBox(
            originX = box.left.toDouble(),
            originY = box.top.toDouble(),
            width = box.width().toDouble(),
            height = box.height().toDouble(),
          ),
        score = detection.categories().firstOrNull()?.score()?.toDouble() ?: 0.0,
        keypoints = keypoints,
      )
    }.toTypedArray()
  }

  companion object {
    private const val TAG = "HybridFaceDetection"
    private const val MODEL_ASSET_PATH = "blaze_face_short_range.tflite"
  }
}
