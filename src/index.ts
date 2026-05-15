import { NitroModules } from 'react-native-nitro-modules'
import type { FaceDetection } from './specs/FaceDetection.nitro'
export type {
  BoundingBox,
  DetectedFace,
  Keypoint,
} from './specs/FaceDetection.nitro'

export const RNFaceDetectionPlugin =
  NitroModules.createHybridObject<FaceDetection>('FaceDetection')

export const FACE_KEYPOINT_COUNT = 6
