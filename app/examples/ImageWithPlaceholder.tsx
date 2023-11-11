import { useEffect, useRef, useState } from "react"

/**
 * @tutorial https://www.jacobparis.com/content/image-placeholders
 */
export function ImageWithPlaceholder({
  src,
  placeholderSrc,
  onLoad,
  ...props
}: {
  src: string
  placeholderSrc?: string
  onLoad?: () => void
  className?: string
}) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src)

  const onLoadRef = useRef(onLoad)

  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  useEffect(() => {
    const img = new Image()

    img.onload = () => {
      setImgSrc(src)
      if (onLoadRef.current) {
        onLoadRef.current()
      }
    }

    img.src = src
  }, [src])

  return <img src={imgSrc} alt="" {...props} />
}
