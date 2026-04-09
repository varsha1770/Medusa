import { ExecArgs } from "@medusajs/framework/types";
import { ProductStatus } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function seedFurnitureProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");

  logger.info("Fetching default sales channel and shipping profile...");
  const query = container.resolve("query");

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  });

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
    filters: {
      name: "Default",
    },
  });

  const defaultSalesChannelId = salesChannels[0]?.id;
  const defaultShippingProfileId = shippingProfiles[0]?.id;

  if (!defaultSalesChannelId) {
    logger.warn("No sales channel found, skipping furniture seed.");
    return;
  }

  logger.info("Inserting furniture products...");

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Luxury Modern Royal Sofa Set",
          description: "A beautifully crafted royal sofa set to elevate your living room. Ergonomic comfort meets timeless design.",
          handle: "luxury-modern-royal-sofa",
          weight: 45000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: defaultShippingProfileId,
          images: [
            { url: "https://tif-medusa-demo.s3.amazonaws.com/Luxury_Sofa.webp" }
          ],
          options: [
            {
              title: "Size",
              values: ["M", "L", "XL"],
            },
            {
              title: "Color",
              values: ["Velvet Gray", "Midnight Blue"],
            }
          ],
          variants: [
            {
              title: "L / Velvet Gray",
              sku: "SOFA-L-GRAY",
              options: {
                Size: "L",
                Color: "Velvet Gray"
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 29000, 
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannelId,
            },
          ],
        },
        {
          title: "Dublin Ergonomic Comfort Chair",
          description: "Experience the ultimate relaxation with the Dublin Ergonomic Chair. Perfectly contoured for back support. Premium foam and fabric.",
          handle: "dublin-ergonomic-chair",
          weight: 12000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: defaultShippingProfileId,
          images: [
            { url: "https://tif-medusa-demo.s3.amazonaws.com/Dublin_Chair.webp" }
          ],
          options: [
            {
              title: "Size",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CHAIR-STD",
              options: {
                Size: "Standard",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 14800,
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannelId,
            },
          ],
        },
        {
          title: "Artisanal Happy Bear Sculpture",
          description: "Add a touch of whimsy to your setup with this artisanal hand-crafted bear sculpture.",
          handle: "artisanal-happy-bear",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: defaultShippingProfileId,
          images: [
            { url: "https://tif-medusa-demo.s3.amazonaws.com/Happy_Bear.webp" }
          ],
          options: [
            {
              title: "Size",
              values: ["One Size"],
            },
          ],
          variants: [
            {
              title: "One Size",
              sku: "BEAR-OS",
              options: {
                Size: "One Size",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 9600,
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannelId,
            },
          ],
        },
        {
          title: "Premium Multi-color Comfort Shoes",
          description: "Vibrant and incredibly comfortable running and casual shoes for everyday wear.",
          handle: "premium-multi-shoes",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: defaultShippingProfileId,
          images: [
            { url: "https://tif-medusa-demo.s3.amazonaws.com/Shoe-Multi_color.webp" }
          ],
          options: [
            {
              title: "Size",
              values: ["7", "8", "9", "10"],
            },
          ],
          variants: [
            {
              title: "9",
              sku: "SHOE-9",
              options: {
                Size: "9",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 5900,
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannelId,
            },
          ],
        },
      ],
    },
  });

  logger.info("Successfully seeded furniture and mock homepage products!");
}
