import React, { useEffect, useMemo } from 'react'
import { DetectedFace, RNFaceDetectionPlugin } from 'rn-face-detection'
import { createSynchronizable } from 'react-native-worklets'
import { SkiaCamera } from 'react-native-vision-camera-skia'
import { useAsyncRunner, useCameraPermission } from 'react-native-vision-camera'

import { drawFaceKeypoints } from './utils'

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission()

  const asyncRunner = useAsyncRunner()
  const latestFaces = useMemo(
    () => createSynchronizable<DetectedFace[]>([]),
    []
  )

  useEffect(() => {
    if (!hasPermission) requestPermission()
  }, [hasPermission, requestPermission])

  return (
    <SkiaCamera
      style={{ flex: 1 }}
      isActive={true}
      device="front"
      constraints={[{ fps: 30 }, { binned: true }]}
      pixelFormat="rgb"
      enablePreviewSizedOutputBuffers={true}
      enablePhysicalBufferRotation={true}
      onFrame={(frame, render) => {
        'worklet'
        const faces = latestFaces.getDirty()

        render(({ frameTexture, canvas }) => {
          drawFaceKeypoints({
            frameTexture,
            frame,
            faces,
            canvas,
          })
        })

        const wasHandled = asyncRunner.runAsync(() => {
          'worklet'
          try {
            const nextFaces: DetectedFace[] = RNFaceDetectionPlugin.call(frame)
            latestFaces.setBlocking(nextFaces)
          } finally {
            frame.dispose()
          }
        })

        if (!wasHandled) {
          frame.dispose()
        }
      }}
    />
  )
}
