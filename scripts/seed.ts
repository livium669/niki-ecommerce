import './load-env';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { db } from '../lib/db/client';
import { brandTable, categoryTable, collectionTable, colorTable, genderTable, productCollectionTable, productImageTable, productTable, productVariantTable, sizeTable } from '../lib/db/schemas/catalog';

type ColorRef = { id: string; name: string; slug: string };
type SizeRef = { id: string; name: string; slug: string };
type CategoryRef = { id: string; name: string; slug: string };

const log = {
  info: (msg: string) => console.log(`[seed] ${msg}`),
  warn: (msg: string) => console.warn(`[seed:warn] ${msg}`),
  error: (msg: string, e?: unknown) => console.error(`[seed:error] ${msg}`, e),
};

function id() {
  return randomUUID();
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readLocalImages(): string[] {
  const srcDir = path.join(process.cwd(), 'public', 'shoes');
  if (!fs.existsSync(srcDir)) {
    log.warn(`No local images found at ${srcDir}. Skipping image uploads.`);
    return [];
  }
  const files = fs.readdirSync(srcDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  if (files.length === 0) {
    log.warn(`public/shoes has no image files. Skipping image uploads.`);
  } else {
    log.info(`Found ${files.length} images in public/shoes`);
  }
  return files.map(f => path.join(srcDir, f));
}

async function main() {
  const menId = id();
  const womenId = id();
  const nikeId = id();

  const perfCatId = id();
  const lifeCatId = id();
  const racingCatId = id();

  const blackId = id();
  const whiteId = id();
  const redId = id();

  const sizeSId = id();
  const sizeMId = id();
  const sizeLId = id();

  const collections = [
    { id: id(), name: "Summer '25", slug: 'summer-25' },
    { id: id(), name: 'Performance Elite', slug: 'performance-elite' },
    { id: id(), name: 'Urban Motion', slug: 'urban-motion' },
  ];

  const localImages = readLocalImages();
  const uploadsDir = path.join(process.cwd(), 'public', 'static', 'uploads');
  ensureDir(uploadsDir);

  log.info('Cleaning up database...');
  await db.delete(productImageTable);
  await db.delete(productVariantTable);
  await db.delete(productCollectionTable);
  await db.delete(productTable);
  await db.delete(collectionTable);
  await db.delete(sizeTable);
  await db.delete(colorTable);
  await db.delete(categoryTable);
  await db.delete(brandTable);
  await db.delete(genderTable);

  log.info('Seeding filters and references...');
  await db.insert(genderTable).values([{ id: menId, label: 'Men', slug: 'men' }, { id: womenId, label: 'Women', slug: 'women' }]);
  await db.insert(brandTable).values([{ id: nikeId, name: 'Nike', slug: 'nike' }]);
  await db.insert(categoryTable).values([
    { id: perfCatId, name: 'Performance', slug: 'performance' },
    { id: lifeCatId, name: 'Lifestyle', slug: 'lifestyle' },
    { id: racingCatId, name: 'Racing', slug: 'racing' },
  ]);
  await db.insert(colorTable).values([
    { id: blackId, name: 'Black', slug: 'black', hexCode: '#000000' },
    { id: whiteId, name: 'White', slug: 'white', hexCode: '#FFFFFF' },
    { id: redId, name: 'Red', slug: 'red', hexCode: '#FF0000' },
  ]);
  await db.insert(sizeTable).values([
    { id: sizeSId, name: 'S', slug: 's', sortOrder: 1 },
    { id: sizeMId, name: 'M', slug: 'm', sortOrder: 2 },
    { id: sizeLId, name: 'L', slug: 'l', sortOrder: 3 },
  ]);
  await db.insert(collectionTable).values(collections);

  const categories: CategoryRef[] = [
    { id: perfCatId, name: 'Performance', slug: 'performance' },
    { id: lifeCatId, name: 'Lifestyle', slug: 'lifestyle' },
    { id: racingCatId, name: 'Racing', slug: 'racing' },
  ];
  const colors: ColorRef[] = [
    { id: blackId, name: 'Black', slug: 'black' },
    { id: whiteId, name: 'White', slug: 'white' },
    { id: redId, name: 'Red', slug: 'red' },
  ];
  const sizes: SizeRef[] = [
    { id: sizeSId, name: 'S', slug: 's' },
    { id: sizeMId, name: 'M', slug: 'm' },
    { id: sizeLId, name: 'L', slug: 'l' },
  ];

  const names = [
    'Air One Dark','Void Runner','Onyx Stealth','Shadow Elite','Carbon Sprint',
    'Aero Flux','Kinetic Rise','Nebula Pace','Ion Drift','Quantum Glide',
    'Vortex Trail','Hyper Pulse','Nimbus Core','Zenith Flow','Nova Track',
    'Niki Air Force One'
  ];

  const imageUrls: Record<string, string[]> = {
    'Niki Air Force One': ["/shoes/shoe-1.jpg"],
    'Air One Dark': ["/shoes/niki1.jpg"],
    'Void Runner': ["/shoes/niki2.jpg"],
    'Onyx Stealth': ["/shoes/niki3.jpg"],
    'Shadow Elite': ["/shoes/niki4.png"],
    'Carbon Sprint': ["/shoes/niki5.png"],
    'Aero Flux': ["/shoes/niki6.png"],
    'Kinetic Rise': ["/shoes/niki7.png"],
    'Nebula Pace': ["/shoes/niki8.png"],
    'Ion Drift': ["/shoes/niki9.png"],
    'Quantum Glide': ["/shoes/niki10.png"],
    'Vortex Trail': ["/shoes/shoe-1.jpg"],
    'Hyper Pulse': ["/shoes/shoe-7.avif"],
    'Nimbus Core': ["/shoes/shoe-9.avif"],
    'Zenith Flow': ["/shoes/shoe-10.avif"],
    'Nova Track': ["/shoes/shoe-11.avif"]
  };

  const mockIds: Record<string, string> = {
    'Air One Dark': '00000000-0000-0000-0000-000000000001',
    'Void Runner': '00000000-0000-0000-0000-000000000002',
    'Onyx Stealth': '00000000-0000-0000-0000-000000000003',
    'Shadow Elite': '00000000-0000-0000-0000-000000000004',
    'Carbon Sprint': '00000000-0000-0000-0000-000000000005',
    'Aero Flux': '00000000-0000-0000-0000-000000000006',
  };

  log.info(`Seeding ${names.length} products with variants and images...`);

  let productCount = 0;
  for (const name of names) {
    const pid = mockIds[name] || id();
    const category = pick(categories);
    const genderId = Math.random() > 0.5 ? menId : womenId;

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await db.insert(productTable).values({
      id: pid,
      name,
      slug,
      description: 'High-performance sneaker engineered for kinetic luxury.',
      categoryId: category.id,
      genderId,
      brandId: nikeId,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Assign to 1–2 collections
    const assigned = collections.filter(() => Math.random() > 0.5);
    const pickedCollections = assigned.length ? assigned : [pick(collections)];
    for (const col of pickedCollections) {
      await db.insert(productCollectionTable).values({ id: id(), productId: pid, collectionId: col.id });
    }

    const variantCount = 2 + Math.floor(Math.random() * 3); // 2–4 variants
    const variantIds: string[] = [];
    const usedCombinations = new Set<string>();

    for (let v = 0; v < variantCount; v++) {
      let color = pick(colors);
      let size = pick(sizes);
      let combo = `${color.slug}-${size.slug}`;
      let attempts = 0;
      
      // Try to find a unique combination
      while (usedCombinations.has(combo) && attempts < 10) {
        color = pick(colors);
        size = pick(sizes);
        combo = `${color.slug}-${size.slug}`;
        attempts++;
      }
      
      if (usedCombinations.has(combo)) continue; // Skip if we couldn't find a unique one
      usedCombinations.add(combo);

      const price = 220 + Math.floor(Math.random() * 80); // 220–300
      const hasSale = Math.random() > 0.6;
      const salePrice = hasSale ? (price - Math.floor(Math.random() * 30)) : undefined;
      const sku = `${name.toLowerCase().replace(/\s+/g, '-')}-${color.slug}-${size.slug}`;
      const vid = id();
      variantIds.push(vid);
      await db.insert(productVariantTable).values({
        id: vid,
        productId: pid,
        sku,
        price: price.toFixed(2),
        salePrice: salePrice ? salePrice.toFixed(2) : undefined,
        colorId: color.id,
        sizeId: size.id,
        inStock: 5 + Math.floor(Math.random() * 40),
        weight: (0.7 + Math.random() * 0.3).toFixed(2),
        dimensions: { length: 28 + Math.floor(Math.random() * 6), width: 9 + Math.floor(Math.random() * 3), height: 11 + Math.floor(Math.random() * 3) },
        createdAt: new Date(),
      });
    }

    // Use external images
    const productImages = imageUrls[name] || ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"];
    let sort = 0;
    
    // For each variant, assign images
    for (const vid of variantIds) {
      // Just assign the first image for now to keep it simple, or iterate if multiple
      for (const url of productImages) {
        await db.insert(productImageTable).values({
          id: id(),
          productId: pid,
          variantId: vid,
          url,
          sortOrder: sort,
          isPrimary: sort === 0,
        });
        sort += 1;
      }
    }
    
    productCount += 1;
  }
  log.info(`Seeded ${productCount} products`);
}

main().then(() => {
  log.info('Seed completed successfully');
  process.exit(0);
}).catch((e) => {
  log.error('Seed failed', e);
  process.exit(1);
});
