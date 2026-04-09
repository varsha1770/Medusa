import { Button, Container, Text } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  return (
    <Container className="max-w-4xl h-full bg-gray-1 border border-gray-3 w-full p-8 font-euclid-circular-a">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-dark text-xl">
          Your demo product was successfully created! 🎉
        </Text>
        <Text className="text-dark-4 text-small-regular">
          You can now continue setting up your store in the admin.
        </Text>
        <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
          <Button className="w-full bg-blue text-white hover:bg-blue-dark border-0">Continue setup in admin</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
