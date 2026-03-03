import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export type FileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'image'

function detectFileType(mimeType: string): FileType {
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') return 'docx'
  if (mimeType === 'text/plain') return 'txt'
  if (mimeType.startsWith('image/')) return 'image'
  return 'pdf'
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

export async function uploadToStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  uid: string,
): Promise<{ storageKey: string; signedUrl: string; fileType: FileType }> {
  const fileType = detectFileType(mimeType)

  // Cloudinary resource type: 'raw' for PDFs/DOCX/TXT, 'image' for images
  const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw'

  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `docufree/users/${uid}`,
        resource_type: resourceType,
        public_id: `${Date.now()}-${originalName.replace(/[^a-z0-9.]/gi, '_')}`,
        context: { uploaded_by: uid, original_name: originalName },
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    bufferToStream(buffer).pipe(uploadStream)
  })

  console.log(`[storage] Uploaded ${fileType} to ${result.public_id} (${result.secure_url})`)

  return {
    storageKey: result.public_id,   // Cloudinary public_id used as our storage key
    signedUrl: cloudinary.url(result.public_id, {
      resource_type: resourceType,
      secure: true,
      sign_url: true,
      // Default expiry is 1 hour, which is fine for most cases since we refresh it
    }),
    fileType,
  }
}

export async function deleteFromStorage(storageKey: string): Promise<void> {
  try {
    // Try both resource types since we don't store which was used
    await cloudinary.uploader.destroy(storageKey, { resource_type: 'raw' }).catch(() => null)
    await cloudinary.uploader.destroy(storageKey, { resource_type: 'image' }).catch(() => null)
  } catch {
    // Swallow — file may already be gone
  }
}

// Cloudinary URLs for raw/private resources need signatures
export async function refreshSignedUrl(storageKey: string, fileType: string): Promise<string> {
  const resourceType = fileType === 'image' ? 'image' : 'raw'

  const url = cloudinary.url(storageKey, {
    resource_type: resourceType,
    secure: true,
    sign_url: true,
  })

  console.log(`[storage] Refreshed URL for ${storageKey} (${fileType}):`, url)
  return url
}
