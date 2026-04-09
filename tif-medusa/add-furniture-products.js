/**
 * Script to add furniture products to the Medusa store via Admin API.
 * Run from the tif-medusa backend directory:
 *   node add-furniture-products.js
 */

const MEDUSA_URL = "http://localhost:9000";

// High-quality furniture product image URLs (Unsplash/public domain)
const FURNITURE_PRODUCTS = [
  {
    title: "Luxury Modern Royal Sofa",
    handle: "luxury-modern-royal-sofa",
    description: "A stunning luxury royal sofa with premium upholstery and solid wood frame. Perfect for grand living rooms that demand elegance and comfort.",
    categoryName: "Sofas",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
    ],
    originalPrice: 39000,
    salePrice: 29000,
    sku: "SOFA-ROYAL-001",
  },
  {
    title: "Dublin Ergonomic Accent Chair",
    handle: "dublin-ergonomic-accent-chair",
    description: "The Dublin Ergonomic Chair features premium soft-touch fabric and 360-degree swivel base. Designed for maximum comfort and modern aesthetics.",
    categoryName: "Chairs",
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
    ],
    originalPrice: 18500,
    salePrice: 14800,
    sku: "CHAIR-DUBLIN-001",
  },
  {
    title: "Nordic Minimalist Dining Table",
    handle: "nordic-minimalist-dining-table",
    description: "Solid oak dining table with clean Nordic lines. Seats 6 comfortably. Natural oil finish for durability and beauty.",
    categoryName: "Tables",
    images: [
      "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80",
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    ],
    originalPrice: 32000,
    salePrice: 24500,
    sku: "TABLE-NORDIC-001",
  },
  {
    title: "Velvet Tufted Wingback Chair",
    handle: "velvet-tufted-wingback-chair",
    description: "A classic wingback chair reimagined in deep velvet with hand-tufted detailing. Solid hardwood legs with antique brass finish.",
    categoryName: "Chairs",
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    originalPrice: 22000,
    salePrice: 17500,
    sku: "CHAIR-WINGBACK-001",
  },
  {
    title: "Scandinavian 3-Seater Sofa",
    handle: "scandinavian-3-seater-sofa",
    description: "Clean Scandinavian design with premium linen upholstery. Removable and washable covers. Solid birch wood legs.",
    categoryName: "Sofas",
    images: [
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    originalPrice: 45000,
    salePrice: 36000,
    sku: "SOFA-SCANDI-001",
  },
  {
    title: "Industrial Butcher Block Coffee Table",
    handle: "industrial-butcher-block-coffee-table",
    description: "Solid mango wood top with black powder-coated iron frame. Perfect blend of rustic warmth and industrial edge.",
    categoryName: "Tables",
    images: [
      "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=800&q=80",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
    ],
    originalPrice: 12000,
    salePrice: 9800,
    sku: "TABLE-COFFEE-001",
  },
  {
    title: "Rattan Bohemian Lounge Chair",
    handle: "rattan-bohemian-lounge-chair",
    description: "Handwoven natural rattan with plush cotton cushion. Brings tropical, breezy vibes to any living space.",
    categoryName: "Chairs",
    images: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    ],
    originalPrice: 15000,
    salePrice: 11200,
    sku: "CHAIR-RATTAN-001",
  },
  {
    title: "Empire Chesterfield Sofa",
    handle: "empire-chesterfield-sofa",
    description: "The iconic Chesterfield design in genuine leather with deep button tufting and scroll arms. A timeless statement piece.",
    categoryName: "Sofas",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
    ],
    originalPrice: 58000,
    salePrice: 46500,
    sku: "SOFA-CHESTER-001",
  },
];

async function getAdminToken() {
  // Try to log in with default credentials
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@medusa-test.com", password: "supersecret" }),
  });

  if (!res.ok) {
    // Try another common password
    const res2 = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@medusa-test.com", password: "secret" }),
    });
    if (!res2.ok) {
      throw new Error("Failed to authenticate. Check admin email/password.");
    }
    const data2 = await res2.json();
    return data2.token;
  }

  const data = await res.json();
  return data.token;
}

async function getOrCreateCategory(token, name, parentId = null) {
  // Check if category exists
  const res = await fetch(`${MEDUSA_URL}/admin/product-categories?q=${encodeURIComponent(name)}&limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const existing = data.product_categories?.find((c) => c.name === name);
  if (existing) {
    console.log(`  Category already exists: ${name} (${existing.id})`);
    return existing.id;
  }

  // Create category
  const createRes = await fetch(`${MEDUSA_URL}/admin/product-categories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, is_active: true, parent_category_id: parentId }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Failed to create category ${name}: ${JSON.stringify(createData)}`);
  }
  console.log(`  Created category: ${name} (${createData.product_category.id})`);
  return createData.product_category.id;
}

async function getSalesChannel(token) {
  const res = await fetch(`${MEDUSA_URL}/admin/sales-channels?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.sales_channels?.[0]?.id;
}

async function getShippingProfile(token) {
  const res = await fetch(`${MEDUSA_URL}/admin/shipping-profiles?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.shipping_profiles?.[0]?.id;
}

async function createProduct(token, product, categoryId, salesChannelId, shippingProfileId) {
  // Check if product already exists
  const checkRes = await fetch(`${MEDUSA_URL}/admin/products?q=${encodeURIComponent(product.title)}&limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const checkData = await checkRes.json();
  const existing = checkData.products?.find((p) => p.handle === product.handle);
  if (existing) {
    console.log(`  Product already exists: ${product.title}`);
    return;
  }

  const body = {
    title: product.title,
    handle: product.handle,
    description: product.description,
    status: "published",
    category_ids: [categoryId],
    images: product.images.map((url) => ({ url })),
    thumbnail: product.images[0],
    options: [{ title: "Material", values: ["Standard", "Premium"] }],
    variants: [
      {
        title: "Standard",
        sku: product.sku + "-STD",
        options: { Material: "Standard" },
        manage_inventory: false,
        prices: [
          { currency_code: "eur", amount: product.salePrice },
          { currency_code: "usd", amount: Math.round(product.salePrice * 1.1) },
        ],
      },
      {
        title: "Premium",
        sku: product.sku + "-PREM",
        options: { Material: "Premium" },
        manage_inventory: false,
        prices: [
          { currency_code: "eur", amount: product.originalPrice },
          { currency_code: "usd", amount: Math.round(product.originalPrice * 1.1) },
        ],
      },
    ],
    sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
  };

  if (shippingProfileId) {
    body.shipping_profile_id = shippingProfileId;
  }

  const res = await fetch(`${MEDUSA_URL}/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  ERROR creating ${product.title}:`, JSON.stringify(data).slice(0, 300));
  } else {
    console.log(`  Created product: ${product.title} (${data.product.id})`);
  }
}

async function main() {
  console.log("=== Adding Furniture Products to Medusa Store ===\n");

  let token;
  try {
    token = await getAdminToken();
    console.log("✓ Authenticated with Medusa Admin\n");
  } catch (e) {
    console.error("✗ Authentication failed:", e.message);
    console.log("\nPlease check the ADMIN_EMAIL and ADMIN_PASSWORD variables at the top of this script.");
    process.exit(1);
  }

  // Get required IDs
  const salesChannelId = await getSalesChannel(token);
  const shippingProfileId = await getShippingProfile(token);
  console.log(`Sales Channel: ${salesChannelId || "none"}`);
  console.log(`Shipping Profile: ${shippingProfileId || "none"}\n`);

  // Create a parent Furniture category
  const furnitureCatId = await getOrCreateCategory(token, "Furniture");

  // Create sub-categories
  const categories = {};
  for (const cat of ["Sofas", "Chairs", "Tables"]) {
    categories[cat] = await getOrCreateCategory(token, cat, furnitureCatId);
  }

  console.log("\nCreating furniture products...\n");

  for (const product of FURNITURE_PRODUCTS) {
    const catId = categories[product.categoryName];
    if (!catId) {
      console.error(`No category for: ${product.categoryName}`);
      continue;
    }
    await createProduct(token, product, catId, salesChannelId, shippingProfileId);
  }

  console.log("\n=== Done! Refresh your storefront to see the furniture products. ===");
}

main().catch(console.error);
