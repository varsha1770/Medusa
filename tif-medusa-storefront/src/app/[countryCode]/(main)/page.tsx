import { Metadata } from "next"

import NextCommerceHome from "@modules/home/components/nextcommerce"

export const metadata: Metadata = {
  title: "NextCommerce | Landing Page",
  description: "NextCommerce landing page integrated into Medusa storefront.",
}

export default async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  await props.params

  return (
    <NextCommerceHome />
  )
}
