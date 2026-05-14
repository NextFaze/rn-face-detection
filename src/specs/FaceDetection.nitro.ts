import { type HybridObject } from 'react-native-nitro-modules'
import type { Frame } from 'react-native-vision-camera'

export interface Keypoint {
  x: number
  y: number
}

export interface FaceDetection extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  call(frame: Frame): Array<Array<Keypoint>>
}
