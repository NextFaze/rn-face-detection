import { PaintStyle, SkCanvas, Skia, SkImage } from '@shopify/react-native-skia'
import { Frame } from 'react-native-vision-camera'
import { FACE_KEYPOINT_COUNT, type DetectedFace } from 'rn-face-detection'

export const FACE_CONNECTIONS: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [0, 4],
  [1, 5],
  [2, 4],
  [2, 5],
  [3, 4],
  [3, 5],
]

export const faceJointPaint = Skia.Paint()
faceJointPaint.setAntiAlias(true)
faceJointPaint.setColor(Skia.Color('#ffcc00'))

export const faceBoxPaint = Skia.Paint()
faceBoxPaint.setAntiAlias(true)
faceBoxPaint.setStyle(PaintStyle.Stroke)
faceBoxPaint.setStrokeWidth(3)
faceBoxPaint.setColor(Skia.Color('#00e5ff'))

export const drawFaceKeypoints = ({
  frameTexture,
  frame,
  faces,
  canvas,
}: {
  frameTexture: SkImage
  frame: Frame
  faces: DetectedFace[]
  canvas: SkCanvas
}) => {
  'worklet'
  try {
    canvas.drawImage(frameTexture, 0, 0)
    const fw = frame.width
    const fh = frame.height
    for (const face of faces) {
      const box = face.boundingBox
      if (box.width > 0 && box.height > 0) {
        canvas.drawRect(
          {
            x: box.originX,
            y: box.originY,
            width: box.width,
            height: box.height,
          },
          faceBoxPaint
        )
      }

      const keypoints = face.keypoints
      if (keypoints.length < FACE_KEYPOINT_COUNT) continue

      for (const p of keypoints) {
        canvas.drawCircle(p.x * fw, p.y * fh, 5, faceJointPaint)
      }
    }
  } catch (error) {
    console.error(error)
  }
}
