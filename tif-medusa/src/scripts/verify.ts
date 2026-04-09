import { ExecArgs } from "@medusajs/framework/types";

export default async function verifyProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "sales_channels.*"],
    filters: {
      handle: ["luxury-modern-royal-sofa", "dublin-ergonomic-chair"]
    }
  });

  logger.info("Found products: " + JSON.stringify(products, null, 2));

  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "type", "sales_channels.*"]
  });

  logger.info("API Keys: " + JSON.stringify(apiKeys, null, 2));
}
