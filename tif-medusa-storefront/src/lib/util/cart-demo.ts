export const DEMO_CART_STORAGE_KEY = "storefront:demo-cart-items"
export const DEMO_CART_UPDATED_EVENT = "storefront:demo-cart-updated"

export type DemoItem = {
  id: string
  variantId: string
  title: string
  handle: string
  thumbnail: string | null
  price: number
  quantity: number
}

export const getDemoItems = (): DemoItem[] => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(DEMO_CART_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const getDemoTotalCount = (): number => {
  return getDemoItems().reduce((acc, item) => acc + item.quantity, 0)
}

export const getDemoSubtotal = (): number => {
  return getDemoItems().reduce((acc, item) => acc + item.price * item.quantity, 0)
}

export const addDemoItem = (item: Omit<DemoItem, "quantity"> & { quantity?: number }) => {
  if (typeof window === "undefined") {
    return
  }

  const items = getDemoItems()
  const existing = items.find((i) => i.variantId === item.variantId)

  if (existing) {
    existing.quantity += item.quantity ?? 1
  } else {
    items.push({ ...item, quantity: item.quantity ?? 1 })
  }

  window.localStorage.setItem(DEMO_CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(DEMO_CART_UPDATED_EVENT))
}

export const removeDemoItem = (variantId: string) => {
  if (typeof window === "undefined") {
    return
  }

  const items = getDemoItems().filter((i) => i.variantId !== variantId)
  window.localStorage.setItem(DEMO_CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(DEMO_CART_UPDATED_EVENT))
}

export const updateDemoItemQuantity = (variantId: string, quantity: number) => {
  if (typeof window === "undefined") {
    return
  }

  const items = getDemoItems()
  const existing = items.find((i) => i.variantId === variantId)

  if (existing) {
    if (quantity <= 0) {
      removeDemoItem(variantId)
      return
    }
    existing.quantity = quantity
    window.localStorage.setItem(DEMO_CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(DEMO_CART_UPDATED_EVENT))
  }
}

export const clearDemoCart = () => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(DEMO_CART_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(DEMO_CART_UPDATED_EVENT))
}

// Deprecated: for backward compatibility during transition
export const getDemoCartCount = getDemoTotalCount
