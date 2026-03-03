import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useEditorStore } from '@/store'
import { cn } from '@/lib/utils'

// Use CDN worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  url: string
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const { zoom, currentPage, setTotalPages, setPage } = useEditorStore()

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setContainerWidth(w - 64)
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-surface-900 p-8">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
        loading={<PageSkeleton />}
        error={<ErrorPlaceholder />}
        className="flex flex-col items-center gap-6"
      >
        <Page
          pageNumber={currentPage}
          width={containerWidth * zoom}
          renderTextLayer
          renderAnnotationLayer
          className="shadow-2xl rounded-sm overflow-hidden"
          loading={<PageSkeleton />}
        />
      </Document>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="bg-surface-700 animate-pulse rounded-sm" style={{ width: 800, height: 1130 }} />
  )
}

function ErrorPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-[var(--text-muted)]">
      <p className="text-sm">Failed to load PDF</p>
    </div>
  )
}
