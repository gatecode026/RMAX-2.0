require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const mongoose = require('mongoose');

async function seedShredder() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const ikData = JSON.parse(fs.readFileSync('imagekit_shredder_uploaded.json', 'utf8'));
  console.log('Loaded ImageKit data for', ikData.length, 'assets');

  const { Product } = require('../src/models/Product');
  const { ProductCategory } = require('../src/models/ProductCategory');
  const { ProductBrand } = require('../src/models/ProductBrand');

  // 1. Fetch Brand & Category
  let brand = await ProductBrand.findOne({ slug: 'rmax-solutions' });
  if (!brand) {
    brand = await ProductBrand.create({
      name: 'RMAX Solutions',
      slug: 'rmax-solutions',
      description: 'Indian manufacturer and OEM supplier of smart hygiene and plastic waste management machinery.',
      sortOrder: 1,
      active: true
    });
  }

  let category = await ProductCategory.findOne({ slug: 'plastic-waste-machinery' });
  if (!category) {
    category = await ProductCategory.create({
      name: 'Plastic Waste Management Machinery',
      slug: 'plastic-waste-machinery',
      description: 'Industrial machinery for plastic recycling, dust separation, shredding and baling.',
      sortOrder: 3,
      active: true
    });
  }

  // 2. Fetch Product 1 (Dust Remover Machine) to establish reciprocal relatedProduct link
  const product1 = await Product.findOne({ slug: 'dust-remover-machine' });
  if (!product1) {
    console.warn('Warning: Product 1 (dust-remover-machine) not found in DB!');
  } else {
    console.log('Found Product 1 (Dust Remover Machine):', product1._id);
  }

  // 3. Prepare ImageKit references
  const mainImg = ikData.find(i => i.type === 'main') || ikData[0];
  const chamberImg = ikData.find(i => i.name === 'plastic-waste-shredder-cutting-chamber') || ikData[1];
  const motorImg = ikData.find(i => i.name === 'plastic-waste-shredder-motor-drive') || ikData[2];
  const catUnitImg = ikData.find(i => i.name === 'plastic-waste-shredder-catalogue-unit') || ikData[3];
  const thumbImg = ikData.find(i => i.type === 'thumbnail') || ikData[4];

  const shredderDoc = {
    name: 'Plastic Waste Shredder Machine',
    title: 'Plastic Waste Shredder Machine – Model 100',
    shortName: 'Plastic Waste Shredder Machine',
    slug: 'plastic-waste-shredder-machine',
    sku: 'RMAX-PWS-M100-002',
    model: '100',
    manufacturer: 'RMAX Solutions',
    countryOfOrigin: 'India',
    brandId: brand._id,
    categoryId: category._id,
    category: 'plastic-waste-machinery',
    subcategory: 'Plastic Waste Shredding Equipment',
    productType: 'Industrial Plastic Waste Processing Machinery',
    tags: [
      'Plastic Waste Shredder Machine',
      'Industrial Plastic Shredder',
      'Plastic Waste Processing Machine',
      'Plastic Recycling Machinery',
      'Plastic Shredder Model 100',
      'Waste Size Reduction Machine',
      'RMAX Solutions'
    ],
    isFeatured: true,
    isNewArrival: true,
    colours: ['Industrial Blue', 'Industrial White'],
    price: 999,
    originalPrice: 999,
    discountPercent: 0,
    gstApplicable: true,
    gstRate: 18,
    taxType: 'exclusive',
    stockStatus: 'made-to-order',
    stock: 10,
    enableStockManagement: true,
    status: 'published',
    publishedAt: new Date(),
    summary: 'The Plastic Waste Shredder Machine reduces bulky plastic waste into uniform, manageable pieces using a combination of rotary and stationary blades. It is supplied complete with a stainless-steel weighing system for accurate throughput monitoring, giving it a rated capacity of 1 tonne per day.',
    intro: 'The Plastic Waste Shredder Machine reduces bulky plastic waste into uniform, manageable pieces using a combination of rotary and stationary blades. It is supplied complete with a stainless-steel weighing system for accurate throughput monitoring, giving it a rated capacity of 1 tonne per day.',
    overview: 'The RMAX Plastic Waste Shredder Machine Model 100 is designed to reduce bulky plastic waste into uniform, manageable pieces for further processing. Its rotary and stationary blade configuration supports plastic waste size reduction. The supplied stainless-steel weighing system enables throughput quantity monitoring. The machine has a rated processing capacity of 1 tonne per day and is equipped with a 10 HP motor.',
    image: {
      src: mainImg.url,
      alt: 'RMAX Plastic Waste Shredder Machine Model 100 with Stainless Steel Weighing Accessories',
      width: mainImg.width || 785,
      height: mainImg.height || 1140
    },
    cardImage: {
      src: mainImg.url,
      alt: 'RMAX Plastic Waste Shredder Machine Model 100',
      width: 600,
      height: 750
    },
    overviewImage: {
      src: catUnitImg.url,
      alt: 'RMAX Plastic Waste Shredder Machine – Workshop Processing Unit',
      width: catUnitImg.width || 460,
      height: catUnitImg.height || 640
    },
    images: ikData.map((img, i) => ({
      fileId: img.fileId,
      url: img.url,
      filePath: img.filePath,
      type: img.type,
      alt: img.alt,
      isPrimary: img.isPrimary,
      sortOrder: i,
      width: img.width,
      height: img.height
    })),
    gallery: [
      { src: mainImg.url, thumb: thumbImg.url, alt: mainImg.alt, kind: 'image' },
      { src: chamberImg.url, thumb: chamberImg.url, alt: chamberImg.alt, kind: 'image' },
      { src: motorImg.url, thumb: motorImg.url, alt: motorImg.alt, kind: 'image' },
      { src: catUnitImg.url, thumb: catUnitImg.url, alt: catUnitImg.alt, kind: 'image' }
    ],
    chips: ['1 Tonne/day', '10 HP Motor', '4 + 2 Blades', '300 kg Weighing Pan'],
    specs: {
      dailyCapacity: '1 Tonne/day',
      batchCapacity: 'Continuous operation',
      power: '10 HP',
      weight: '1500 × 750 × 1500 mm (approx.)',
      colours: 'Industrial Blue / White',
      cycleDuration: 'Continuous throughput',
      chamber: '4 Rotary + 2 Stationary Blades',
      maintenance: 'Adjustable blade and belt mounting',
      warranty: 'Contact RMAX Solutions',
      delivery: 'Made to Order · PAN India'
    },
    techSpecs: [
      { label: 'Capacity', value: '1 Tonne/day', unit: 'Tonne/day', order: 1 },
      { label: 'Machine Size (L × W × H)', value: '1500 × 750 × 1500 mm (approx.)', unit: 'mm', order: 2 },
      { label: 'Number of Rotary Blades', value: '4', order: 3 },
      { label: 'Number of Stationary Blades', value: '2', order: 4 },
      { label: 'Motor', value: '10 HP', unit: 'HP', order: 5 },
      { label: 'Weighing Machinery', value: 'Stainless steel pan', order: 6 },
      { label: 'Weighing Pan Capacity', value: '300 kg', unit: 'kg', order: 7 },
      { label: 'Weighing Least Count', value: '50 g', unit: 'g', order: 8 },
      { label: 'Weighing Pan Size', value: '450 × 550 mm', unit: 'mm', order: 9 }
    ],
    features: [
      {
        icon: 'flame',
        title: '1 Tonne/Day Processing Capacity',
        body: 'Rated daily processing capacity of 1 tonne for plastic waste size reduction.',
        order: 1
      },
      {
        icon: 'settings',
        title: 'Efficient Blade Configuration',
        body: 'Combination of four rotary and two stationary blades.',
        order: 2
      },
      {
        icon: 'cog',
        title: 'Powerful 10 HP Motor',
        body: 'Equipped with a specified 10 HP motor.',
        order: 3
      },
      {
        icon: 'shield',
        title: 'Integrated Weighing System',
        body: 'Supplied with an integrated stainless-steel weighing pan.',
        order: 4
      },
      {
        icon: 'truck',
        title: '300 kg Weighing Capacity',
        body: 'Weighing pan supports a capacity of 300 kg.',
        order: 5
      },
      {
        icon: 'wrench',
        title: 'Accurate Weight Monitoring',
        body: 'The weighing system has a specified least count of 50 g.',
        order: 6
      },
      {
        icon: 'institution',
        title: 'Compact Industrial Footprint',
        body: 'Approximate machine dimensions of 1500 × 750 × 1500 mm.',
        order: 7
      }
    ],
    applications: [
      {
        icon: 'institution',
        title: 'Plastic Recycling Facilities',
        body: 'For size reduction of bulky plastic waste.',
        order: 1
      },
      {
        icon: 'office',
        title: 'Plastic Waste Processing Units',
        body: 'For processing plastic waste into manageable pieces.',
        order: 2
      },
      {
        icon: 'hospital',
        title: 'Material Recovery Facilities',
        body: 'For supporting plastic waste processing operations.',
        order: 3
      },
      {
        icon: 'school',
        title: 'Industrial Recycling Operations',
        body: 'For plastic waste size reduction and quantity monitoring.',
        order: 4
      }
    ],
    faqs: [
      {
        question: 'What is the capacity of the Plastic Waste Shredder Machine?',
        answer: 'The catalogue specifies a rated capacity of 1 tonne per day.',
        order: 1
      },
      {
        question: 'What is the motor power?',
        answer: 'The machine is equipped with a 10 HP motor.',
        order: 2
      },
      {
        question: 'How many blades are included?',
        answer: 'Four rotary blades and two stationary blades.',
        order: 3
      },
      {
        question: 'Does the machine include a weighing system?',
        answer: 'Yes. It is supplied with a stainless-steel weighing pan.',
        order: 4
      },
      {
        question: 'What is the weighing pan capacity?',
        answer: 'The specified weighing pan capacity is 300 kg.',
        order: 5
      },
      {
        question: 'What is the least count of the weighing system?',
        answer: 'The specified least count is 50 g.',
        order: 6
      },
      {
        question: 'What are the machine dimensions?',
        answer: 'Approximately 1500 × 750 × 1500 mm (L × W × H).',
        order: 7
      },
      {
        question: 'How can I request the product quotation?',
        answer: 'Use the Request a Quote option on the product page to submit your enquiry.',
        order: 8
      }
    ],
    warranty: {
      available: false,
      description: 'Contact RMAX Solutions for warranty, installation and service details.',
      postWarrantySupport: 'Contact manufacturer for spare parts and servicing.'
    },
    seo: {
      title: 'RMAX Plastic Waste Shredder Machine Model 100 | 1 Tonne/Day',
      metaDescription: 'Explore the RMAX Plastic Waste Shredder Machine Model 100 with 1 tonne/day rated capacity, 10 HP motor and integrated stainless-steel weighing system.',
      focusKeyword: 'Plastic Waste Shredder Machine',
      canonicalUrl: 'https://rmaxsolutions.com/products/plastic-waste-shredder-machine'
    },
    relatedProductIds: product1 ? [product1._id] : [],
    priceHistory: [
      {
        price: 999,
        originalPrice: 999,
        changedAt: new Date(),
        changedBy: 'Admin Setup'
      }
    ],
    sortOrder: 11
  };

  const existingShredder = await Product.findOne({ slug: 'plastic-waste-shredder-machine' });
  let savedShredder;
  if (existingShredder) {
    savedShredder = await Product.findByIdAndUpdate(existingShredder._id, { $set: shredderDoc }, { new: true });
    console.log('✔ Updated existing Plastic Waste Shredder Machine in MongoDB, ID:', savedShredder._id);
  } else {
    savedShredder = await Product.create(shredderDoc);
    console.log('✔ Created new Plastic Waste Shredder Machine in MongoDB, ID:', savedShredder._id);
  }

  // Also update Product 1 to link to Product 2 in relatedProductIds
  if (product1) {
    await Product.findByIdAndUpdate(product1._id, {
      $addToSet: { relatedProductIds: savedShredder._id }
    });
    console.log('✔ Updated Product 1 (Dust Remover Machine) to link related product:', savedShredder._id);
  }

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('Database ID:', savedShredder._id);
  console.log('SKU:', savedShredder.sku);
  console.log('Slug:', savedShredder.slug);
  console.log('Name:', savedShredder.name);
  console.log('Price:', savedShredder.price);
  console.log('Status:', savedShredder.status);
  console.log('Tech Specs Count:', savedShredder.techSpecs.length);
  console.log('Features Count:', savedShredder.features.length);
  console.log('Applications Count:', savedShredder.applications.length);
  console.log('FAQs Count:', savedShredder.faqs.length);
  console.log('Images Count in DB:', savedShredder.images.length);
  console.log('Main Image CDN:', savedShredder.image.src);

  process.exit(0);
}

seedShredder().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
