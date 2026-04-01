import { useState, useEffect } from 'react'
import { parseIdbPath, getPageImageBlob } from '../../lib/bookStorage'

interface BookImageProps {
  src: string
  alt?: string
  className?: string
}

export default function BookImage({ src, alt = '', className = '' }: BookImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    const idbInfo = parseIdbPath(src)
    if (idbInfo) {
      // Load from IndexedDB
      getPageImageBlob(idbInfo.bookId, idbInfo.pageIndex).then(blob => {
        if (cancelled) return
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setResolvedSrc(objectUrl)
        } else {
          setError(true)
        }
      }).catch(() => {
        if (!cancelled) setError(true)
      })
    } else {
      // Regular URL path
      setResolvedSrc(src)
    }

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (error || !resolvedSrc) {
    return (
      <div className={`flex items-center justify-center bg-[#FFF8F0] text-gray-300 ${className}`}>
        <span className="text-3xl">📄</span>
      </div>
    )
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
