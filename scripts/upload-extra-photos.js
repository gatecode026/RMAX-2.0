const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ImageKit = require('imagekit');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const EXTRA_PRODUCTS = [
  {
    slug: 'toilet-feedback-machine',
    file: 'scripts/product-photos/toilet-feedback-machine.jpg',
    alt: 'Toilet Feedback Machine – 3-Button IoT Washroom Rating System'
  },
  {
    slug: 'gps-trackers',
    file: 'scripts/product-photos/gps-trackers.jpg',
    alt: 'GPS Trackers – Real-Time Vehicle & Fleet Tracking Device'
  },
  {
    slug: 'usb-gps-receiver',
    file: 'scripts/product-photos/usb-gps-receiver.jpg',
    alt: 'USB GPS Receiver – Plug-and-Play High Sensitivity Location Dongle'
  },
  {
    slug: 'plastic-bottle-crusher-machine',
    file: 'scripts/product-photos/plastic-bottle-crusher-machine.jpg',
    alt: 'Plastic Bottle Crusher Machine – Reverse Vending PET Volume Reducer'
  },
  {
    slug: 'led-advertisement-screens',
    file: 'scripts/product-photos/led-advertisement-screens.jpg',
    alt: 'LED Advertisement Screens – High-Brightness Commercial Display'
  },
  {
    slug: 'push-button-sanitary-napkin-vending-machine',
    file: 'scripts/product-photos/push-button-sanitary-napkin-vending-machine.jpg',
    alt: 'Push-Button Sanitary Napkin Vending Machine – Wall-Mount Unit'
  }
];

const CONSISTENT_PROMAX = [
  { file: 'public/images/dashboard/promax-render.jpg', alt: 'Sanitary Pad Disposal Machine – 500 Pad Commercial Incinerator (Wall Mount Scene)' },
  { file: 'public/images/dashboard/promax-machine-hq.png', alt: 'Commercial Incinerator – 500-Pad Heavy Gauge Steel Construction' },
  { file: 'public/images/dashboard/promax-cutout.png', alt: 'Commercial Incinerator – Ash Drawer and Exhaust Flue Details' },
  { file: 'public/images/dashboard/promax-machine-card.png', alt: 'Commercial Incinerator – Digital Display and Control Panel' },
  { file: 'public/images/products/promax-transparent.png', alt: 'Commercial Incinerator – High-Capacity Washroom Waste Unit' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');
  const col = mongoose.connection.collection('products');

  // 1. Upload extra products
  for (const item of EXTRA_PRODUCTS) {
    if (!fs.existsSync(item.file)) {
      console.warn('File not found:', item.file);
      continue;
    }
    console.log(`Uploading WebP for ${item.slug}...`);
    const webpBuf = await sharp(item.file)
      .rotate()
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();

    const meta = await sharp(webpBuf).metadata();
    const fileName = `${item.slug}-main-${Date.now()}.webp`;
    const uploaded = await ik.upload({
      file: webpBuf,
      fileName,
      folder: `/rmax/products/${item.slug}/main`,
      useUniqueFileName: true,
    });

    console.log(`Uploaded -> ${uploaded.url}`);

    const primaryImage = {
      src: uploaded.url,
      alt: item.alt,
      width: meta.width || 600,
      height: meta.height || 600,
    };
    const imgDoc = {
      fileId: uploaded.fileId,
      url: uploaded.url,
      filePath: uploaded.filePath,
      type: 'main',
      alt: item.alt,
      isPrimary: true,
      sortOrder: 0,
      width: meta.width || 600,
      height: meta.height || 600,
    };
    const galItem = {
      src: uploaded.url,
      thumb: uploaded.url,
      alt: item.alt,
      kind: 'image',
    };

    await col.updateOne(
      { slug: item.slug },
      {
        $set: {
          image: primaryImage,
          cardImage: primaryImage,
          portraitImage: primaryImage,
          listImage: primaryImage,
          overviewImage: primaryImage,
          images: [imgDoc],
          gallery: [galItem],
        }
      }
    );
    console.log(`Updated product in DB: ${item.slug}`);
  }

  // 2. Fix 500-pad Pro-Max consistent images
  console.log('\n--- Re-uploading consistent dark blue images for sanitary-pad-disposal-machine-500-pad ---');
  const promaxGallery = [];
  const promaxImages = [];
  let primaryPromax = null;

  for (let i = 0; i < CONSISTENT_PROMAX.length; i++) {
    const item = CONSISTENT_PROMAX[i];
    if (!fs.existsSync(item.file)) {
      console.warn('File not found:', item.file);
      continue;
    }
    const webpBuf = await sharp(item.file)
      .rotate()
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();

    const meta = await sharp(webpBuf).metadata();
    const fileName = `sanitary-pad-disposal-machine-500-pad-angle-${i + 1}-${Date.now()}.webp`;
    const uploaded = await ik.upload({
      file: webpBuf,
      fileName,
      folder: `/rmax/products/sanitary-pad-disposal-machine-500-pad/gallery`,
      useUniqueFileName: true,
    });

    console.log(`Uploaded Pro-Max angle ${i + 1} -> ${uploaded.url}`);

    const imgDoc = {
      fileId: uploaded.fileId,
      url: uploaded.url,
      filePath: uploaded.filePath,
      type: i === 0 ? 'main' : 'gallery',
      alt: item.alt,
      isPrimary: i === 0,
      sortOrder: i,
      width: meta.width || 800,
      height: meta.height || 800,
    };
    promaxImages.push(imgDoc);

    const galItem = {
      src: uploaded.url,
      thumb: uploaded.url,
      alt: item.alt,
      kind: 'image',
    };
    promaxGallery.push(galItem);

    if (i === 0) {
      primaryPromax = {
        src: uploaded.url,
        alt: item.alt,
        width: meta.width || 800,
        height: meta.height || 800,
      };
    }
  }

  if (promaxGallery.length > 0) {
    await col.updateOne(
      { slug: 'sanitary-pad-disposal-machine-500-pad' },
      {
        $set: {
          image: primaryPromax,
          cardImage: primaryPromax,
          portraitImage: primaryPromax,
          listImage: primaryPromax,
          overviewImage: primaryPromax,
          images: promaxImages,
          gallery: promaxGallery,
        }
      }
    );
    console.log('Successfully updated sanitary-pad-disposal-machine-500-pad with 100% consistent images!');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

