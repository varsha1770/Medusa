"use client"

import {
  WISHLIST_UPDATED_EVENT,
  WishlistItem,
  writeWishlist,
  readWishlist,
} from "@lib/util/wishlist"
import { useEffect, useMemo, useState } from "react"

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const syncWishlist = () => {
      setItems(readWishlist())
    }

    syncWishlist()
    window.addEventListener("storage", syncWishlist)
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)

    return () => {
      window.removeEventListener("storage", syncWishlist)
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)
    }
  }, [])

  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items]
  )

  const saveItems = (nextItems: WishlistItem[]) => {
    setItems(nextItems)
    writeWishlist(nextItems)
  }

  const addItem = (item: WishlistItem) => {
    if (itemMap.has(item.id)) {
      return
    }

    saveItems([item, ...items])
  }

  const removeItem = (itemId: string) => {
    saveItems(items.filter((item) => item.id !== itemId))
  }

  const clearItems = () => {
    saveItems([])
  }

  const isInWishlist = (itemId: string) => itemMap.has(itemId)

  const toggleItem = (item: WishlistItem) => {
    if (itemMap.has(item.id)) {
      removeItem(item.id)
      return false
    }

    addItem(item)
    return true
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    saveItems(items.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  return {
    items,
    count: items.reduce((acc, item) => acc + (item.quantity ?? 1), 0),
    addItem,
    removeItem,
    updateQuantity,
    clearItems,
    isInWishlist,
    toggleItem,
  }
}
