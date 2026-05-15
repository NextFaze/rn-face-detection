import { type HybridObject } from 'react-native-nitro-modules'
import type { Frame } from 'react-native-vision-camera'

export interface Keypoint {
  x: number
  y: number
}

export interface BoundingBox {
  originX: number
  originY: number
  width: number
  height: number
}

export interface DetectedFace {
  boundingBox: BoundingBox
  score: number
  keypoints: Keypoint[]
}

export interface FaceDetection extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  call(frame: Frame): DetectedFace[]
}
