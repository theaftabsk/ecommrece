import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Shop
  const shop = await prisma.shop.upsert({
    where: { slug: 'maheorthe' },
    update: {},
    create: {
      name: 'MAHEORTHE PRODUCTS',
      slug: 'maheorthe',
      description: 'Pure, hygienic and totally chemical-free herbal products.',
      plan: 'pro',
      status: 'active',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });

  console.log(`Created shop: ${shop.name} (${shop.id})`);

  // 2. Create Shop Domain mapping
  await prisma.shopDomain.upsert({
    where: { domain: 'maheorthe.localhost' },
    update: {},
    create: {
      shop_id: shop.id,
      domain: 'maheorthe.localhost',
      type: 'subdomain',
      is_primary: true,
      status: 'active',
      verified_at: new Date(),
    },
  });

  // Create default owner user
  const owner = await prisma.user.upsert({
    where: { email: 'owner@maheorthe.com' },
    update: {
      password: 'maheorthe123',
    },
    create: {
      shop_id: shop.id,
      name: 'Swati Maheorthe',
      email: 'owner@maheorthe.com',
      password_hash: '$2b$10$placeholder_hash_value',
      password: 'maheorthe123',
      role: 'owner',
    }
  });

  // Link owner to shop
  await prisma.shop.update({
    where: { id: shop.id },
    data: { owner_id: owner.id }
  });

  // 3. Create Categories
  const categoryNames = [
    { name: 'Creams', slug: 'creams', sort: 1 },
    { name: 'Hair Oils', slug: 'hair-oils', sort: 2 },
    { name: 'Ubtan Powder', slug: 'ubtan-powder', sort: 3 },
    { name: 'Shampoo', slug: 'shampoo', sort: 4 },
    { name: 'Facewash', slug: 'facewash', sort: 5 },
    { name: 'Body Oils', slug: 'body-oils', sort: 6 },
    { name: 'Jelly', slug: 'jelly', sort: 7 },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoryNames) {
    const dbCat = await prisma.category.upsert({
      where: { shop_id_slug: { shop_id: shop.id, slug: cat.slug } },
      update: {},
      create: {
        shop_id: shop.id,
        name: cat.name,
        slug: cat.slug,
        sort_order: cat.sort,
        is_active: true,
      },
    });
    categoriesMap[cat.slug] = dbCat.id;
  }

  // 4. Create Brand
  const brand = await prisma.brand.upsert({
    where: { shop_id_slug: { shop_id: shop.id, slug: 'maheorthe' } },
    update: {},
    create: {
      shop_id: shop.id,
      name: 'MAHEORTHE',
      slug: 'maheorthe',
      is_active: true,
    },
  });

  // 5. Create Main Product: Charcoal Ubtan (65ml)
  const charcoalUbtan = await prisma.product.upsert({
    where: { shop_id_slug: { shop_id: shop.id, slug: 'charcoal-ubtan-65ml' } },
    update: {},
    create: {
      shop_id: shop.id,
      category_id: categoriesMap['ubtan-powder'],
      brand_id: brand.id,
      name: 'Charcoal Ubtan (65ml)',
      slug: 'charcoal-ubtan-65ml',
      short_desc: 'Activated charcoal and hand-pound Multani mitti purifying blend.',
      description: 'Maheorthe Charcoal Ubtan is a purifying blend designed to draw out impurities, excess oil, and pollution from deep within the pores. Made with activated charcoal and pure hand-pound Multani mitti, this powder-based cleanser works as both a mask and a mild exfoliant — leaving skin fresh, matte, and visibly clearer.',
      price: 250.00,
      compare_price: 300.00,
      status: 'active',
      is_featured: true,
      has_variants: false,
      custom_sections: [
        {
          id: 'benefits',
          title: 'Benefits',
          type: 'bullets',
          content: [
            'Deeply cleanses and unclogs pores.',
            'Absorbs oil and detoxifies without over-drying.',
            'Helps calm breakouts and blemishes.',
            'Refines skin texture over time.',
            'Made with only two potent, natural ingredients.',
          ],
        },
        {
          id: 'ingredients',
          title: "What's In It",
          type: 'cards',
          content: [
            {
              name: 'Charcoal',
              description: 'Activated to pull toxins, dirt, and oil from the skin, leaving it purified and refreshed.',
              image_url: '/images/ingredients/charcoal.jpg',
            },
            {
              name: 'Pure Multani Mitti',
              description: 'A mineral-rich clay that gently exfoliates, tightens pores, and cools the skin.',
              image_url: '/images/ingredients/multani-mitti.jpg',
            },
          ],
        },
        {
          id: 'usage',
          title: 'Ideal Usage and Results',
          type: 'details',
          content: {
            frequency: 'Use 2 times weekly to manage buildup and excess oil.',
            follow_up: 'Follow up with a light moisturizer or Maheorthe’s Lavender oil.',
            results: [
              'Reduced blackheads, whiteheads, and congestion.',
              'A clearer, more refined skin texture.',
              'Reduces pigmentation.',
              'Improved balance in oily or acne-prone areas.',
              'Great for post-commute or post-workout skin reset.',
            ],
            shelf_life: 'Best used within 24 months. Store in a dry place, keep away from children, and remember to take a patch test before regular use.',
            image_url: '/images/products/charcoal-ubtan-usage.jpg',
          },
        },
        {
          id: 'how-to-use',
          title: 'How to Use?',
          type: 'steps',
          content: [
            { step: 1, title: 'Step 1', description: 'Take 1–2 teaspoons in a clean bowl.' },
            { step: 2, title: 'Step 2', description: 'Add rose water or plain water to form a smooth paste.' },
            { step: 3, title: 'Step 3', description: 'Apply evenly over the face and neck, avoiding the eye area.' },
            { step: 4, title: 'Step 4', description: 'Leave on for 10–12 minutes. Do not let it fully dry.' },
            { step: 5, title: 'Step 5', description: 'Rinse gently with lukewarm water in circular motions.' },
          ],
        },
      ],
    },
  });

  // Add Variant for Charcoal Ubtan
  const mainVariant = await prisma.productVariant.upsert({
    where: { sku: 'MAH-CHAR-UBT-65' },
    update: {},
    create: {
      shop_id: shop.id,
      product_id: charcoalUbtan.id,
      sku: 'MAH-CHAR-UBT-65',
      label: '65ml',
      price: 250.00,
      stock_qty: 100,
      is_active: true,
    },
  });

  // Add Product Gallery Images
  await prisma.productGallery.createMany({
    data: [
      { shop_id: shop.id, product_id: charcoalUbtan.id, url: '/images/products/charcoal-ubtan-1.jpg', sort_order: 1, is_cover: true },
      { shop_id: shop.id, product_id: charcoalUbtan.id, url: '/images/products/charcoal-ubtan-2.jpg', sort_order: 2, is_cover: false },
      { shop_id: shop.id, product_id: charcoalUbtan.id, url: '/images/products/charcoal-ubtan-3.jpg', sort_order: 3, is_cover: false },
    ],
  });

  // Add Product FAQs
  await prisma.productFaq.createMany({
    data: [
      {
        shop_id: shop.id,
        product_id: charcoalUbtan.id,
        question: 'Can I use this ubtan on active acne or irritated skin?',
        answer: 'Yes, but with care. The ingredients are gentle, but avoid scrubbing over inflamed breakouts. Apply as a soft mask instead of exfoliating, and rinse without rubbing if your skin is sensitive.',
      },
      {
        shop_id: shop.id,
        product_id: charcoalUbtan.id,
        question: 'Is this safe to use on sensitive skin types?',
        answer: 'Yes, Multani mitti is naturally cooling and gentle. However, always perform a patch test on your elbow before applying it to your face.',
      },
      {
        shop_id: shop.id,
        product_id: charcoalUbtan.id,
        question: 'Can I use this as a daily face wash?',
        answer: 'No, because it contains mild exfoliating clay, we recommend using it 2-3 times a week rather than daily to avoid over-exfoliation.',
      },
    ],
  });

  // Add Testimonials/Reviews
  await prisma.review.createMany({
    data: [
      {
        shop_id: shop.id,
        product_id: charcoalUbtan.id,
        rating: 5,
        title: 'Amazing Results!',
        body: 'Very good products Swati after Using these products getting very nice results!',
        status: 'approved',
      },
      {
        shop_id: shop.id,
        product_id: charcoalUbtan.id,
        rating: 5,
        title: 'Pure and Hygienic',
        body: 'The products are too good. They are pure and hygienic totally chemical-free. Enjoy using them. Keep up the good work!',
        status: 'approved',
      },
    ],
  });

  // 6. Seed Related Products
  const relatedProducts = [
    {
      name: 'Tulsi & Turmeric Petroleum Jelly (50 gms)',
      slug: 'tulsi-turmeric-jelly-50g',
      price: 299.00,
      sku: 'MAH-TUL-TUR-JEL-50',
      category: 'jelly',
    },
    {
      name: 'Hibiscus Petroleum Jelly (50 gms)',
      slug: 'hibiscus-jelly-50g',
      price: 299.00,
      sku: 'MAH-HIB-JEL-50',
      category: 'jelly',
    },
    {
      name: 'Lotus Day & Night Cream (50 gms)',
      slug: 'lotus-cream-50g',
      price: 250.00,
      sku: 'MAH-LOT-CRM-50',
      category: 'creams',
    },
    {
      name: 'Orange Ubtan Powder (50 gms)',
      slug: 'orange-ubtan-50g',
      price: 250.00,
      sku: 'MAH-ORG-UBT-50',
      category: 'ubtan-powder',
    },
  ];

  for (const item of relatedProducts) {
    const dbProd = await prisma.product.upsert({
      where: { shop_id_slug: { shop_id: shop.id, slug: item.slug } },
      update: {},
      create: {
        shop_id: shop.id,
        category_id: categoriesMap[item.category],
        brand_id: brand.id,
        name: item.name,
        slug: item.slug,
        short_desc: `${item.name} for organic skin protection.`,
        price: item.price,
        status: 'active',
        is_featured: false,
        has_variants: false,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        shop_id: shop.id,
        product_id: dbProd.id,
        sku: item.sku,
        label: '50g',
        price: item.price,
        stock_qty: 100,
        is_active: true,
      },
    });

    await prisma.productGallery.create({
      data: {
        shop_id: shop.id,
        product_id: dbProd.id,
        url: `/images/products/${item.slug}.jpg`,
        is_cover: true,
      },
    });
  }

  // 7. Seed Banners
  await prisma.banner.createMany({
    data: [
      {
        shop_id: shop.id,
        title: 'Pure Herbal Skincare Launch',
        image_url: '/images/banners/slider-1.jpg',
        link_url: '/category/ubtan-powder',
        sort_order: 1,
        is_active: true,
      },
      {
        shop_id: shop.id,
        title: 'Chemical-Free Hair Oils & Shampoos',
        image_url: '/images/banners/slider-2.jpg',
        link_url: '/category/hair-oils',
        sort_order: 2,
        is_active: true,
      },
      {
        shop_id: shop.id,
        title: 'Flat 10% Off on First Purchase',
        image_url: '/images/banners/promo-banner-1.jpg',
        link_url: '#',
        sort_order: 3,
        is_active: true,
      },
    ],
  });

  // 8. Seed Product Sections (Homepage Layout Config)
  await prisma.productSection.createMany({
    data: [
      {
        shop_id: shop.id,
        title: 'Best Selling Ubtan Cleansers',
        type: 'carousel',
        config: {
          category_id: categoriesMap['ubtan-powder'],
          limit: 4,
        },
        sort_order: 1,
        is_active: true,
      },
      {
        shop_id: shop.id,
        title: 'New Arrivals',
        type: 'grid',
        config: {
          product_ids: [charcoalUbtan.id],
        },
        sort_order: 2,
        is_active: true,
      },
    ],
  });

  // 9. Seed Tenant Signup Requests
  console.log('Seeding tenant requests...');
  await prisma.tenantRequest.upsert({
    where: { slug: 'organic-roots' },
    update: {},
    create: {
      name: 'Organic Roots Skincare',
      slug: 'organic-roots',
      owner_name: 'Amit Sharma',
      owner_email: 'amit@roots.com',
      phone: '+91 98765 43210',
      category: 'Skincare',
      status: 'pending'
    }
  });

  await prisma.tenantRequest.upsert({
    where: { slug: 'nature-glow' },
    update: {},
    create: {
      name: 'Nature Glow Herbals',
      slug: 'nature-glow',
      owner_name: 'Preeti Patel',
      owner_email: 'preeti@glow.com',
      phone: '+91 91234 56789',
      category: 'Skincare',
      status: 'pending'
    }
  });

  // 10. Seed Additional Active Shop
  console.log('Seeding extra active shop...');
  const kalyanShop = await prisma.shop.upsert({
    where: { slug: 'kalyan-organic' },
    update: {},
    create: {
      name: 'Kalyan Organic Store',
      slug: 'kalyan-organic',
      description: 'Handcrafted wellness and lifestyle skincare.',
      plan: 'starter',
      status: 'active',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    }
  });

  await prisma.shopDomain.upsert({
    where: { domain: 'kalyan-organic.localhost' },
    update: {},
    create: {
      shop_id: kalyanShop.id,
      domain: 'kalyan-organic.localhost',
      type: 'subdomain',
      is_primary: true,
      status: 'active',
      verified_at: new Date(),
    },
  });

  const kalyanOwner = await prisma.user.upsert({
    where: { email: 'kalyan@organic.com' },
    update: {
      password: 'kalyan123',
    },
    create: {
      shop_id: kalyanShop.id,
      name: 'Kalyan Sen',
      email: 'kalyan@organic.com',
      password_hash: '$2b$10$placeholder_hash_value',
      password: 'kalyan123',
      role: 'owner',
    }
  });

  await prisma.shop.update({
    where: { id: kalyanShop.id },
    data: { owner_id: kalyanOwner.id }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
