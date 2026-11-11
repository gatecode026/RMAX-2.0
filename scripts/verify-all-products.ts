import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';
import { Product } from '../src/models/Product';

async function verifyAll() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const products = await Product.find({ category: 'plastic-waste-machinery' }).lean();
  console.log(`--- FOUND ${products.length} PLASTIC WASTE MACHINERY PRODUCTS ---`);
  for (const p of products) {
    console.log(JSON.stringify({
      _id: p._id.toString(),
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      price: p.price,
      status: p.status,
      techSpecsCount: p.techSpecs?.length || 0,
      featuresCount: p.features?.length || 0,
      applicationsCount: p.applications?.length || 0,
      faqsCount: p.faqs?.length || 0,
      imagesCount: p.images?.length || 0,
      relatedCount: p.relatedProductIds?.length || 0,
      warranty: p.warranty?.duration || 'N/A',
      mainImage: p.image?.src
    }, null, 2));
  }
  process.exit(0);
}

verifyAll().catch(err => {
  console.error(err);
  process.exit(1);
});

