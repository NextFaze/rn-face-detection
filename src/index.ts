import { NitroModules } from 'react-native-nitro-modules'
import type { FaceDetection } from './specs/FaceDetection.nitro'
export type { Keypoint } from './specs/FaceDetection.nitro'

export const RNFaceDetection =
  NitroModules.createHybridObject<FaceDetection>('FaceDetection')
