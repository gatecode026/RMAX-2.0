require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const mongoose = require('mongoose');

async function seedBailingMachine() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const ikData = JSON.parse(fs.readFileSync('imagekit_bailing_uploaded.json', 'utf8'));
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

  // 2. Fetch Product 1 & Product 2 to establish reciprocal relatedProduct links
  const product1 = await Product.findOne({ slug: 'dust-remover-machine' });
  const product2 = await Product.findOne({ slug: 'plastic-waste-shredder-machine' });

  if (product1) console.log('Found Product 1 (Dust Remover Machine):', product1._id);
  if (product2) console.log('Found Product 2 (Plastic Waste Shredder Machine):', product2._id);

  // 3. Prepare ImageKit references
  const mainImg = ikData.find(i => i.type === 'main') || ikData[0];
  const chamberImg = ikData.find(i => i.name === 'plastic-bailing-machine-chamber-doors') || ikData[1];
  const powerpackImg = ikData.find(i => i.name === 'plastic-bailing-machine-hydraulic-powerpack') || ikData[2];
  const catUnitImg = ikData.find(i => i.name === 'plastic-bailing-machine-catalogue-unit') || ikData[3];
  const thumbImg = ikData.find(i => i.type === 'thumbnail') || ikData[4];

  const relatedIds = [];
  if (product1) relatedIds.push(product1._id);
  if (product2) relatedIds.push(product2._id);

  const bailingDoc = {
    name: 'Plastic Bailing Machine',
    title: 'Plastic Bailing Machine – Hydraulic Vertical Baler',
    shortName: 'Plastic Bailing Machine',
    slug: 'plastic-bailing-machine',
    sku: 'RMAX-PBM-003',
    model: '', // Not specified in the catalogue
    manufacturer: 'RMAX Solutions',
    countryOfOrigin: 'India',
    brandId: brand._id,
    categoryId: category._id,
    category: 'plastic-waste-machinery',
    subcategory: 'Plastic Baling Equipment',
    productType: 'Hydraulic Vertical Baler',
    tags: [
      'Plastic Bailing Machine',
      'Hydraulic Vertical Baler',
      'Plastic Waste Baler',
      'Plastic Recycling Machinery',
      'Industrial Baling Machine',
      'Up to 50 Tonnes Baler',
      'RMAX Solutions'
    ],
    isFeatured: true,
    isNewArrival: true,
    colours: ['Industrial Blue', 'Industrial Green'],
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
    summary: 'The RMAX Plastic Bailing Machine is a hydraulic vertical baler designed to compress loose and shredded plastic waste into compact, uniform bales for easier storage and transportation. It features a hydraulic gear-cum-plunger pump system, a heavy-duty mild-steel body and a vertical clamping mechanism with a stated capacity of up to 50 tonnes.',
    intro: 'The RMAX Plastic Bailing Machine is a hydraulic vertical baler designed to compress loose and shredded plastic waste into compact, uniform bales for easier storage and transportation. It features a hydraulic gear-cum-plunger pump system, a heavy-duty mild-steel body and a vertical clamping mechanism with a stated capacity of up to 50 tonnes.',
    overview: 'The RMAX Plastic Bailing Machine is designed for compressing loose and processed plastic waste into dense, manageable bales. Its hydraulic vertical clamping mechanism applies compression force to reduce the volume of plastic waste, making handling, storage and transportation easier. The machine uses a hydraulic gear-cum-plunger pump system and a heavy-duty mild-steel construction. It includes a twin-door arrangement and dual rope-tie provisions for securing compressed bales. The catalogue specifies a bailing capacity of up to 50 tonnes.',
    image: {
      src: mainImg.url,
      alt: 'RMAX Plastic Bailing Machine Hydraulic Vertical Baler',
      width: mainImg.width || 792,
      height: mainImg.height || 1380
    },
    cardImage: {
      src: mainImg.url,
      alt: 'RMAX Plastic Bailing Machine',
      width: 600,
      height: 750
    },
    overviewImage: {
      src: catUnitImg.url,
      alt: 'RMAX Plastic Bailing Machine – Industrial Vertical Baler Unit',
      width: catUnitImg.width || 460,
      height: catUnitImg.height || 580
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
      { src: powerpackImg.url, thumb: powerpackImg.url, alt: powerpackImg.alt, kind: 'image' },
      { src: catUnitImg.url, thumb: catUnitImg.url, alt: catUnitImg.alt, kind: 'image' }
    ],
    chips: ['Up to 50 Tonnes', '7.5 HP Motor', '50–60 kg Bale', '1 Year Warranty'],
    specs: {
      dailyCapacity: 'Up to 50 Tonnes (Baling Capacity)',
      batchCapacity: '50–60 kg Bale Weight',
      power: '7.5 HP',
      weight: 'Mild Steel (MS) Body',
      colours: 'Industrial Blue / Green',
      cycleDuration: 'Standard Hydraulic Cycle',
      chamber: '700 × 500 × 1400 mm',
      maintenance: 'Standard Hydraulic & Electrical Maintenance',
      warranty: '1 Year Manufacturer Warranty',
      delivery: 'Made to Order · PAN India'
    },
    techSpecs: [
      { label: 'Machine Type', value: 'Hydraulic Vertical Baler', order: 1 },
      { label: 'Clamping Mechanism', value: 'Hydraulic Vertical', order: 2 },
      { label: 'Body Material', value: 'Mild Steel (MS)', order: 3 },
      { label: 'Bailing Capacity', value: 'Up to 50 Tonnes', unit: 'Tonnes', order: 4 },
      { label: 'Chamber Size', value: '700 × 500 × 1400 mm', unit: 'mm', order: 5 },
      { label: 'Bale Size', value: '700 × 500 × 650 mm', unit: 'mm', order: 6 },
      { label: 'Bale Weight', value: '50–60 kg', unit: 'kg', order: 7 },
      { label: 'Hydraulic Cylinder', value: '1', order: 8 },
      { label: 'Hydraulic Pump', value: 'Gear-cum-Plunger Pump', order: 9 },
      { label: 'Daylight Gap', value: '1400 mm', unit: 'mm', order: 10 },
      { label: 'Motor Power', value: '7.5 HP', unit: 'HP', order: 11 },
      { label: 'Rope Ties', value: '2', order: 12 },
      { label: 'Doors', value: '2', order: 13 },
      { label: 'Body Plate Thickness', value: '8 mm', unit: 'mm', order: 14 },
      { label: 'Clamping Plate Thickness', value: '30 mm', unit: 'mm', order: 15 },
      { label: 'Control System', value: 'Electrical Control', order: 16 },
      { label: 'Manufacturer Warranty', value: '1 Year', order: 17 }
    ],
    features: [
      {
        icon: 'cog',
        title: 'Hydraulic Vertical Clamping',
        body: 'Vertical hydraulic compression mechanism engineered to apply high pressing force for maximum volume reduction.',
        order: 1
      },
      {
        icon: 'shield',
        title: 'High Baling Capacity',
        body: 'Catalogue-stated capacity of up to 50 tonnes to compress heavy volumes of industrial plastic scrap.',
        order: 2
      },
      {
        icon: 'institution',
        title: 'Heavy-Duty MS Construction',
        body: 'Robust mild-steel body fabricated with 8 mm plate thickness for maximum rigidity and extended service life.',
        order: 3
      },
      {
        icon: 'wrench',
        title: 'Reinforced Clamping Plate',
        body: 'Heavy 30 mm clamping plate construction resists high compaction pressures without structural deformation.',
        order: 4
      },
      {
        icon: 'settings',
        title: 'Hydraulic Pump System',
        body: 'High-performance gear-cum-plunger pump arrangement delivering dependable hydraulic fluid flow and pressure.',
        order: 5
      },
      {
        icon: 'truck',
        title: 'Twin-Door Design',
        body: 'Two-door machine configuration facilitates easy loading of loose plastics and convenient unloading of pressed bales.',
        order: 6
      },
      {
        icon: 'leaf',
        title: 'Dual Rope-Tie Arrangement',
        body: 'Two dedicated rope ties allow operators to securely strap and bundle the compressed bale before ejection.',
        order: 7
      },
      {
        icon: 'flame',
        title: 'Electrical Control',
        body: 'Integrated electrical control system provides streamlined operator control and reliable cycle execution.',
        order: 8
      },
      {
        icon: 'settings',
        title: 'Industrial Motor',
        body: 'Powered by an industrial 7.5 HP motor calibrated to drive the hydraulic pump system continuously.',
        order: 9
      },
      {
        icon: 'shield',
        title: 'Manufacturer Warranty',
        body: 'One-year manufacturer warranty as stated in the catalogue, supported by RMAX Solutions technical service.',
        order: 10
      }
    ],
    applications: [
      {
        icon: 'institution',
        title: 'Plastic Recycling Facilities',
        body: 'For volume reduction and bundling of loose and processed recyclable plastic waste into transportable bales.',
        order: 1
      },
      {
        icon: 'office',
        title: 'Plastic Waste Processing Units',
        body: 'For compressing plastic waste into manageable, uniform 50–60 kg bales prior to shredding or compounding.',
        order: 2
      },
      {
        icon: 'hospital',
        title: 'Material Recovery Facilities',
        body: 'For efficient segregation, storage, and baling of bulk commercial and municipal post-consumer plastic scrap.',
        order: 3
      },
      {
        icon: 'school',
        title: 'Industrial Plastic Waste Handling Operations',
        body: 'For factories and processing plants requiring continuous on-site scrap compaction to clear workspace floor areas.',
        order: 4
      },
      {
        icon: 'truck',
        title: 'Plastic Waste Storage and Transportation Preparation',
        body: 'Significantly increases payload density per truck and reduces warehouse storage volume requirements.',
        order: 5
      }
    ],
    faqs: [
      {
        question: 'What is a Plastic Bailing Machine?',
        answer: 'A Plastic Bailing Machine compresses loose or processed plastic waste into compact bales for easier handling, storage and transportation.',
        order: 1
      },
      {
        question: 'What type of baler is this machine?',
        answer: 'It is a hydraulic vertical baler.',
        order: 2
      },
      {
        question: 'What is its stated bailing capacity?',
        answer: 'The product catalogue specifies a bailing capacity of up to 50 tonnes.',
        order: 3
      },
      {
        question: 'What is the motor power?',
        answer: 'The catalogue specifies a 7.5 HP motor.',
        order: 4
      },
      {
        question: 'What is the bale weight?',
        answer: 'The stated bale weight is approximately 50–60 kg.',
        order: 5
      },
      {
        question: 'What is the body material?',
        answer: 'The machine body is made of mild steel.',
        order: 6
      },
      {
        question: 'Does it have a hydraulic pump system?',
        answer: 'Yes. The catalogue specifies a hydraulic gear-cum-plunger pump system.',
        order: 7
      },
      {
        question: 'What is the warranty period?',
        answer: 'The catalogue specifies a one-year manufacturer warranty.',
        order: 8
      },
      {
        question: 'How many rope ties and doors are provided?',
        answer: 'The machine specification lists two rope ties and two doors.',
        order: 9
      },
      {
        question: 'Can I request a quotation for this machine?',
        answer: 'Yes. Use the Request a Quote option to submit your enquiry to the RMAX Solutions team.',
        order: 10
      }
    ],
    warranty: {
      available: true,
      duration: '1 Year',
      type: 'Manufacturer Warranty',
      description: 'One-year manufacturer warranty as stated in the catalogue.',
      postWarrantySupport: 'Contact manufacturer for servicing, genuine spare parts, and hydraulic seal kits.'
    },
    seo: {
      title: 'RMAX Plastic Bailing Machine | Hydraulic Vertical Baler',
      metaDescription: 'Explore the RMAX Plastic Bailing Machine, a hydraulic vertical baler with up to 50-tonne stated bailing capacity, heavy-duty MS construction and a one-year manufacturer warranty.',
      focusKeyword: 'Plastic Bailing Machine',
      canonicalUrl: 'https://rmaxsolutions.com/products/plastic-bailing-machine'
    },
    relatedProductIds: relatedIds,
    priceHistory: [
      {
        price: 999,
        originalPrice: 999,
        changedAt: new Date(),
        changedBy: 'Admin Setup'
      }
    ],
    sortOrder: 12
  };

  const existingBailing = await Product.findOne({ slug: 'plastic-bailing-machine' });
  let savedBailing;
  if (existingBailing) {
    savedBailing = await Product.findByIdAndUpdate(existingBailing._id, { $set: bailingDoc }, { new: true });
    console.log('✔ Updated existing Plastic Bailing Machine in MongoDB, ID:', savedBailing._id);
  } else {
    savedBailing = await Product.create(bailingDoc);
    console.log('✔ Created new Plastic Bailing Machine in MongoDB, ID:', savedBailing._id);
  }

  // Reciprocal update: Add Product 3 to Product 1 and Product 2
  if (product1) {
    await Product.findByIdAndUpdate(product1._id, {
      $addToSet: { relatedProductIds: savedBailing._id }
    });
    console.log('✔ Updated Product 1 (Dust Remover Machine) to link related product 3:', savedBailing._id);
  }

  if (product2) {
    await Product.findByIdAndUpdate(product2._id, {
      $addToSet: { relatedProductIds: savedBailing._id }
    });
    console.log('✔ Updated Product 2 (Plastic Waste Shredder Machine) to link related product 3:', savedBailing._id);
  }

  console.log('\n--- PRODUCT 3 VERIFICATION REPORT ---');
  console.log('Database ID:', savedBailing._id);
  console.log('SKU:', savedBailing.sku);
  console.log('Slug:', savedBailing.slug);
  console.log('Name:', savedBailing.name);
  console.log('Price:', savedBailing.price);
  console.log('Status:', savedBailing.status);
  console.log('Tech Specs Count:', savedBailing.techSpecs.length);
  console.log('Features Count:', savedBailing.features.length);
  console.log('Applications Count:', savedBailing.applications.length);
  console.log('FAQs Count:', savedBailing.faqs.length);
  console.log('Warranty Duration:', savedBailing.warranty?.duration);
  console.log('Images Count in DB:', savedBailing.images.length);
  console.log('Main Image CDN:', savedBailing.image.src);
  console.log('Related Products Count:', savedBailing.relatedProductIds.length);

  process.exit(0);
}

seedBailingMachine().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

