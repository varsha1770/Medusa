"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { getDemoItems, clearDemoCart } from "@lib/util/cart-demo"
import { Button, Heading, Text } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CheckoutSync = () => {
  const [status, setStatus] = useState<"checking" | "syncing" | "empty" | "error">("checking")
  const [syncCount, setSyncCount] = useState(0)
  const [totalToSync, setTotalToSync] = useState(0)
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  useEffect(() => {
    const performSync = async () => {
      const items = getDemoItems()
      
      if (items.length === 0) {
        setStatus("empty")
        return
      }

      setStatus("syncing")
      setTotalToSync(items.length)
      
      try {
        // Sync items sequentially to avoid race conditions in Medusa cart creation
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          await addToCart({
            variantId: item.variantId,
            quantity: item.quantity,
            countryCode,
          })
          setSyncCount(i + 1)
        }

        // Clear demo cart after successful sync
        clearDemoCart()
        
        // Refresh the page to let the server-side retrieveCart() work
        router.refresh()
      } catch (error) {
        console.error("Sync error:", error)
        setStatus("error")
      }
    }

    performSync()
  }, [countryCode, router])

  if (status === "empty") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-blue/5 rounded-full flex items-center justify-center mb-8">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <Heading level="h1" className="text-[2.5rem] font-[350] text-dark mb-4">
          Your bag is currently empty
        </Heading>
        <Text className="text-gray-500 max-w-[400px] mb-10 text-lg font-[350]">
          Look through our boutique collection and add some pieces to your cart to begin checkout.
        </Text>
        <LocalizedClientLink href="/store">
          <Button className="h-12 px-10 bg-blue text-white hover:bg-black transition-all rounded-xl border-0 uppercase tracking-widest text-[11px] font-bold">
            Explore Collection
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  if (status === "error") {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Heading level="h1" className="text-2xl font-[350] text-dark mb-4">
          Something went wrong
        </Heading>
        <Text className="text-gray-500 mb-8">
          We encountered an error while synchronizing your boutique selection. Please try again.
        </Text>
        <Button onClick={() => window.location.reload()} className="h-11 px-8 bg-blue text-white rounded-xl">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-blue/10 border-t-blue animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-blue font-bold">
          {totalToSync > 0 ? `${Math.round((syncCount / totalToSync) * 100)}%` : <Spinner />}
        </div>
      </div>
      <Heading level="h1" className="text-2xl font-[350] text-dark mb-3">
        Synchronizing your selection...
      </Heading>
      <Text className="text-gray-500 font-[350]">
        Preparing your boutique experience for checkout.
      </Text>
      <div className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-blue/40">
        <span>Boutique Sync Active</span>
        <span className="w-1 h-1 bg-blue/40 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export default CheckoutSync
