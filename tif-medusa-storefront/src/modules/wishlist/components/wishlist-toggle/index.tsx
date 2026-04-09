"use client"

import { WishlistItem } from "@lib/util/wishlist"
import HeartIcon from "@modules/wishlist/components/heart-icon"
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist"

type WishlistToggleProps = {
  item: WishlistItem
  className?: string
  iconClassName?: string
  label?: string
}

const WishlistToggle = ({
  item,
  className = "",
  iconClassName = "h-5 w-5",
  label,
}: WishlistToggleProps) => {
  const { isInWishlist, toggleItem } = useWishlist()
  const active = isInWishlist(item.id)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleItem(item)
      }}
      className={className}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      data-testid="wishlist-toggle"
    >
      <HeartIcon className={iconClassName} filled={active} />
      {label ? <span>{label}</span> : null}
    </button>
  )
}

export default WishlistToggle
