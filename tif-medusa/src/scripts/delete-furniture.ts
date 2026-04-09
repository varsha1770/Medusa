import { ExecArgs } from "@medusajs/framework/types";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function deleteFurniture({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: {
      handle: [
        "luxury-modern-royal-sofa",
        "dublin-ergonomic-chair",
        "artisanal-happy-bear",
        "premium-multi-shoes"
      ]
    }
  });

  if (products.length === 0) {
    logger.info("No mock furniture products found to delete.");
    return;
  }

  const idsToDelete = products.map((p) => p.id);
  logger.info(`Deleting ${idsToDelete.length} products...`);

  await deleteProductsWorkflow(container).run({
    input: { ids: idsToDelete }
  });

  logger.info("Successfully deleted all 4 mock furniture products.");
}
