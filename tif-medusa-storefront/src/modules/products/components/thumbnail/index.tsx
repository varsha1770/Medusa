import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

import { HttpTypes } from "@medusajs/types"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  variant?: any // Using any to be safe since CartLineItem uses a nested variant type
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  variant,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  let resolvedImage = thumbnail

  // Smart Fallback Heuristic:
  // If the backend doesn't explicitly link variant thumbnails, we can check 
  // if the image URLs contain the variant color name (e.g. 'white', 'black')
  if (variant && images && images.length > 0) {
    const variantValues = (variant.options || []).map((o: any) => (o.value || "").toLowerCase())
    const colorValues = variantValues.filter((v: string) => 
      ["white", "black", "red", "blue", "green", "navy", "grey", "gray"].includes(v)
    )

    if (colorValues.length > 0) {
      const matchedImage = images.find((img: any) => 
        colorValues.some((color: string) => img.url?.toLowerCase().includes(color))
      )
      if (matchedImage) {
        resolvedImage = matchedImage.url
      }
    }
  }

  const initialImage = resolvedImage || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden transition-shadow ease-in-out duration-150",
        {
           "p-4 bg-ui-bg-subtle shadow-elevation-card-rest group-hover:shadow-elevation-card-hover rounded-large": size !== "full",
           "p-0 bg-transparent border-none shadow-none rounded-none": size === "full",
        },
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
}: Pick<ThumbnailProps, "size"> & { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      className="absolute inset-0 object-cover object-center"
      draggable={false}
      quality={50}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
