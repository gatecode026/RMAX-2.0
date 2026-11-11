require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const ikData = JSON.parse(fs.readFileSync('imagekit_uploaded.json', 'utf8'));
  console.log('Loaded ImageKit data for', ikData.length, 'assets');

  const { Product } = require('../src/models/Product');
  const { ProductCategory } = require('../src/models/ProductCategory');
  const { ProductBrand } = require('../src/models/ProductBrand');

  // 1. Ensure Brand
  let brand = await ProductBrand.findOne({ slug: 'rmax-solutions' });
  if (!brand) {
    brand = await ProductBrand.create({
      name: 'RMAX Solutions',
      slug: 'rmax-solutions',
      description: 'Indian manufacturer and OEM supplier of smart hygiene and plastic waste management machinery.',
      sortOrder: 1,
      active: true
    });
    console.log('✔ Created ProductBrand: RMAX Solutions');
  }

  // 2. Ensure Category
  let category = await ProductCategory.findOne({ slug: 'plastic-waste-machinery' });
  if (!category) {
    category = await ProductCategory.create({
      name: 'Plastic Waste Management Machinery',
      slug: 'plastic-waste-machinery',
      description: 'Industrial machinery for plastic recycling, dust separation, shredding and baling.',
      sortOrder: 3,
      active: true
    });
    console.log('✔ Created ProductCategory: Plastic Waste Management Machinery');
  }

  // 3. Prepare ImageKit references
  const mainImg = ikData.find(i => i.type === 'main') || ikData[0];
  const catUnitImg = ikData.find(i => i.name === 'dust-remover-machine-catalogue-unit') || ikData[1];
  const motorImg = ikData.find(i => i.name === 'dust-remover-machine-motor-drive') || ikData[2];
  const casingImg = ikData.find(i => i.name === 'dust-remover-machine-drum-casing') || ikData[3];
  const thumbImg = ikData.find(i => i.type === 'thumbnail') || ikData[4];

  const dustRemoverDoc = {
    name: 'Dust Remover Machine',
    title: 'Dust Remover Machine – RMAX Tru-Mix Series',
    shortName: 'Dust Remover Machine',
    slug: 'dust-remover-machine',
    sku: 'RMAX-TRUMIX-DRM-001',
    model: 'SSM(G) SLWM/2',
    manufacturer: 'RMAX Solutions',
    countryOfOrigin: 'India',
    brandId: brand._id,
    categoryId: category._id,
    category: 'plastic-waste-machinery',
    subcategory: 'Dust Separation & Collection Equipment',
    productType: 'Industrial Plastic Waste Processing Machinery',
    tags: [
      'Dust Remover Machine',
      'Plastic Waste Dust Remover',
      'Industrial Dust Separation Machine',
      'Plastic Recycling Machinery',
      'Plastic Waste Processing Equipment',
      'Rotary Drum Dust Remover',
      'RMAX Tru-Mix Machine'
    ],
    isFeatured: true,
    isNewArrival: true,
    colours: ['Industrial Blue'],
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
    summary: 'The Dust Remover Machine separates fine dust and contaminants from processed plastic waste using a rotary blender-cum-impactor mechanism housed in a perforated drum. Built on a heavy-duty frame, it is designed for continuous industrial operation ahead of the shredding stage.',
    intro: 'The Dust Remover Machine separates fine dust and contaminants from processed plastic waste using a rotary blender-cum-impactor mechanism housed in a perforated drum. Built on a heavy-duty frame, it is designed for continuous industrial operation ahead of the shredding stage.',
    overview: 'The RMAX Tru-Mix Dust Remover Machine is designed for plastic waste processing facilities that require dust separation before the shredding stage. The machine uses a perforated rotary drum and blender-cum-impactor mechanism to separate fine dust and contaminants from processed plastic waste. Its industrial frame construction and adjustable motor mounting arrangement make it suitable for continuous processing operations.',
    image: {
      src: mainImg.url,
      alt: 'RMAX Tru-Mix Industrial Dust Remover Machine – Plastic Waste Dust Separation and Collection Unit',
      width: mainImg.width || 1399,
      height: mainImg.height || 787
    },
    cardImage: {
      src: mainImg.url,
      alt: 'RMAX Tru-Mix Industrial Dust Remover Machine',
      width: 600,
      height: 338
    },
    overviewImage: {
      src: catUnitImg.url,
      alt: 'RMAX Tru-Mix Dust Remover Machine – Workshop Processing Unit',
      width: catUnitImg.width || 445,
      height: catUnitImg.height || 645
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
      { src: catUnitImg.url, thumb: catUnitImg.url, alt: catUnitImg.alt, kind: 'image' },
      { src: motorImg.url, thumb: motorImg.url, alt: motorImg.alt, kind: 'image' },
      { src: casingImg.url, thumb: casingImg.url, alt: casingImg.alt, kind: 'image' }
    ],
    chips: ['120–200 kg/hr', '915 mm Drum', '10–15 HP Motor', '2100 mm Length'],
    specs: {
      dailyCapacity: '120–200 kg/hr',
      batchCapacity: 'Continuous operation',
      power: '10–15 HP, 1200–1600 RPM',
      weight: 'Heavy frame structure',
      colours: 'Industrial Blue',
      cycleDuration: 'Continuous throughput',
      chamber: '915 mm dia. perforated casing',
      maintenance: 'Slot provision for belt tension adjustment',
      warranty: 'Contact RMAX Solutions',
      delivery: 'Made to Order · PAN India'
    },
    techSpecs: [
      { label: 'Drum Diameter', value: '915 mm (perforated casing)', unit: 'mm', order: 1 },
      { label: 'Drum Length', value: '2100 mm', unit: 'mm', order: 2 },
      { label: 'Drum Cover Diameter', value: '1200 mm', unit: 'mm', order: 3 },
      { label: 'Machine Output', value: '120–200 kg/hr', unit: 'kg/hr', order: 4 },
      { label: 'Rotor Type', value: 'Blender cum Impactor', order: 5 },
      { label: 'Main Motor', value: '10–15 HP', unit: 'HP', order: 6 },
      { label: 'Motor Speed', value: '1200–1600 RPM', unit: 'RPM', order: 7 },
      { label: 'Motor Adjustment', value: 'Slot provision provided', order: 8 },
      { label: 'Overall Machine Dimensions (L × W × H)', value: '1200 × 2550 × 1350 mm', unit: 'mm', order: 9 },
      { label: 'Machine Frame', value: 'Heavy frame structure', order: 10 }
    ],
    features: [
      {
        icon: 'settings',
        title: 'Perforated Drum Casing',
        body: '915 mm diameter perforated casing designed for continuous dust separation.',
        order: 1
      },
      {
        icon: 'cog',
        title: 'Blender-cum-Impactor Rotor',
        body: 'Rotor design supports separation of fine dust and contaminants from processed plastic waste.',
        order: 2
      },
      {
        icon: 'flame',
        title: 'High Output Performance',
        body: 'Machine output of 120–200 kg/hr for industrial processing operations.',
        order: 3
      },
      {
        icon: 'wrench',
        title: 'Adjustable Motor Mounting',
        body: 'Slot-provisioned motor mounting allows belt tension adjustment.',
        order: 4
      },
      {
        icon: 'wrench',
        title: 'Easy Maintenance',
        body: 'Motor mounting arrangement supports easier adjustment and maintenance.',
        order: 5
      },
      {
        icon: 'shield',
        title: 'Heavy-Duty Frame',
        body: 'Heavy frame structure designed for industrial stability and operation.',
        order: 6
      }
    ],
    applications: [
      {
        icon: 'institution',
        title: 'Plastic Recycling Facilities',
        body: 'For separation of fine dust and contaminants from processed plastic waste.',
        order: 1
      },
      {
        icon: 'office',
        title: 'Plastic Waste Processing Units',
        body: 'For integration before the shredding stage.',
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
        body: 'For continuous dust separation requirements.',
        order: 4
      }
    ],
    faqs: [
      {
        question: 'What is the main purpose of the Dust Remover Machine?',
        answer: 'It separates fine dust and contaminants from processed plastic waste.',
        order: 1
      },
      {
        question: 'What is the machine output?',
        answer: 'The documented machine output is 120–200 kg/hr.',
        order: 2
      },
      {
        question: 'What type of rotor does the machine use?',
        answer: 'It uses a blender-cum-impactor rotor design.',
        order: 3
      },
      {
        question: 'What is the drum diameter?',
        answer: 'The perforated drum casing has a diameter of 915 mm.',
        order: 4
      },
      {
        question: 'What motor is used?',
        answer: 'The specified main motor is 10–15 HP with a speed range of 1200–1600 RPM.',
        order: 5
      },
      {
        question: 'Is the motor mounting adjustable?',
        answer: 'Yes. The catalogue specifies slot-provisioned motor mounting for belt tension adjustment.',
        order: 6
      },
      {
        question: 'What are the machine dimensions?',
        answer: '1200 × 2550 × 1350 mm (L × W × H).',
        order: 7
      },
      {
        question: 'How can I get the product price?',
        answer: 'Submit a quotation request through the RMAX website to receive pricing information.',
        order: 8
      }
    ],
    warranty: {
      available: false,
      description: 'Contact RMAX Solutions for warranty, installation and service details.',
      postWarrantySupport: 'Contact manufacturer for spare parts and servicing.'
    },
    seo: {
      title: 'RMAX Dust Remover Machine | Industrial Plastic Waste Dust Separation',
      metaDescription: 'Explore the RMAX Tru-Mix Dust Remover Machine for industrial plastic waste dust separation, with 120–200 kg/hr output and heavy-duty frame construction.',
      focusKeyword: 'Dust Remover Machine',
      canonicalUrl: 'https://rmaxsolutions.com/products/dust-remover-machine'
    },
    priceHistory: [
      {
        price: 999,
        originalPrice: 999,
        changedAt: new Date(),
        changedBy: 'Admin Setup'
      }
    ],
    sortOrder: 10
  };

  const existingDrm = await Product.findOne({ slug: 'dust-remover-machine' });
  let savedDrm;
  if (existingDrm) {
    savedDrm = await Product.findByIdAndUpdate(existingDrm._id, { $set: dustRemoverDoc }, { new: true });
    console.log('✔ Updated existing Dust Remover Machine in MongoDB, ID:', savedDrm._id);
  } else {
    savedDrm = await Product.create(dustRemoverDoc);
    console.log('✔ Created new Dust Remover Machine in MongoDB, ID:', savedDrm._id);
  }

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('Database ID:', savedDrm._id);
  console.log('SKU:', savedDrm.sku);
  console.log('Slug:', savedDrm.slug);
  console.log('Name:', savedDrm.name);
  console.log('Price:', savedDrm.price);
  console.log('Status:', savedDrm.status);
  console.log('Tech Specs Count:', savedDrm.techSpecs.length);
  console.log('Features Count:', savedDrm.features.length);
  console.log('Applications Count:', savedDrm.applications.length);
  console.log('FAQs Count:', savedDrm.faqs.length);
  console.log('Images Count in DB:', savedDrm.images.length);
  console.log('Main Image CDN:', savedDrm.image.src);

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
