import VisionCamera
import NitroModules
import MediaPipeTasksVision
import Foundation

class HybridFaceDetection: HybridFaceDetectionSpec {
  private var faceDetector: FaceDetector?

  private func resolveModelPath() -> String? {
    let pluginBundle = Bundle(for: HybridFaceDetection.self)
    if let path = pluginBundle.path(forResource: "blaze_face_short_range", ofType: "tflite") {
      return path
    }
    return Bundle.main.path(forResource: "blaze_face_short_range", ofType: "tflite")
  }

  private func getFaceDetector() throws -> FaceDetector {
    if let faceDetector {
      return faceDetector
    }
    guard let modelPath = resolveModelPath() else {
      NSLog("[rn-face-detection] Model path not found for blaze_face_short_range.tflite")
      throw NSError(domain: "HybridFaceDetection", code: 1)
    }
    NSLog("[rn-face-detection] Creating FaceDetector with model path: %@", modelPath)

    let options = FaceDetectorOptions()
    options.baseOptions.modelAssetPath = modelPath
    options.runningMode = .video
    options.minDetectionConfidence = 0.5
    options.minSuppressionThreshold = 0.5

    let faceDetector = try FaceDetector(options: options)
    self.faceDetector = faceDetector
    return faceDetector
  }

  func call(frame: any HybridFrameSpec) throws -> [[Keypoint]] {
    guard let frame = frame as? any NativeFrame else {
      NSLog("[rn-face-detection] Frame cast to NativeFrame failed")
      return []
    }
    guard let buffer = frame.sampleBuffer else {
      NSLog("[rn-face-detection] sampleBuffer is nil")
      return []
    }

    do {
      let faceDetector = try getFaceDetector()
      let image = try MPImage(sampleBuffer: buffer)
      let timestampMs = Int(CMSampleBufferGetPresentationTimeStamp(buffer).seconds * 1000)
      let result = try faceDetector.detect(
        videoFrame: image,
        timestampInMilliseconds: timestampMs
      )

      var faces: [[Keypoint]] = []

      for detection in result.detections {
        var keypoints: [Keypoint] = []

        for keypoint in detection.keypoints ?? [] {
          keypoints.append(
            Keypoint(
              x: Double(keypoint.location.x),
              y: Double(keypoint.location.y),
            )
          )
        }

        faces.append(keypoints)
      }

      return faces
    } catch {
      NSLog("[rn-face-detection] Detection error: %@", error.localizedDescription)
      throw error
    }
  }
}
