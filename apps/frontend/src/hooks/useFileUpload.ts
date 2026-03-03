import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useFilesStore } from '@/store'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, formatBytes } from '@/lib/utils'
import type { DocuFile, UploadProgress } from '@/types'

export function useFileUpload() {
  const { addFile, setUploadProgress } = useFilesStore()

  const uploadFile = useCallback(async (file: File) => {
    const fileId = crypto.randomUUID()

    setUploadProgress({ fileId, fileName: file.name, progress: 0, status: 'uploading' })

    const form = new FormData()
    form.append('file', file)

    try {
      const { data } = await api.post<DocuFile>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100)
          setUploadProgress({ fileId, fileName: file.name, progress: pct, status: 'uploading' })
        },
      })

      setUploadProgress({ fileId, fileName: file.name, progress: 100, status: 'done' })
      addFile(data)
      toast.success(`${file.name} uploaded`)
      return data
    } catch (err: any) {
      setUploadProgress({ fileId, fileName: file.name, progress: 0, status: 'error', error: err.message })
      toast.error(`Upload failed: ${err.message}`)
      return null
    }
  }, [addFile, setUploadProgress])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDropAccepted: (files) => files.forEach(uploadFile),
    onDropRejected: (rejected) => {
      rejected.forEach(({ file, errors }) => {
        if (errors[0]?.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max ${formatBytes(MAX_FILE_SIZE)}.`)
        } else {
          toast.error(`${file.name}: ${errors[0]?.message}`)
        }
      })
    },
  })

  return { getRootProps, getInputProps, isDragActive, uploadFile }
}
