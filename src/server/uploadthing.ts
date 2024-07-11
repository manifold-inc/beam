import {
  generateUploadButton,
  generateReactHelpers,
} from '@uploadthing/react'

import type { OurFileRouter } from 'app/api/uploadthing/core'

export const { uploadFiles } =
  generateReactHelpers<OurFileRouter>()
export const UploadButton = generateUploadButton<OurFileRouter>()
