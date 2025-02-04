'use client'

import Image from 'next/image'
import { useState } from 'react'

type ImageWithFallbackProps = {
  src: string
  alt: string
  fallbackSrc: string
  fill?: boolean
  className?: string
  sizes?: string
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}
