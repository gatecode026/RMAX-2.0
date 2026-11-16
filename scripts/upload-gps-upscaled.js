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

const GPS_ASSETS = [
  {
    slug: 'usb-gps-receiver',
    sourceFile: 'C:/Users/busin/.gemini/antigravity/brain/1c8d5b88-4b89-4be7-a527-33ead3829568/rmax_usb_gps_receiver_1794805943709.jpg',
    localDestJpg: 'scripts/product-photos/usb-gps-receiver.jpg',
    localDestWebp: 'scripts/product-photos/usb-gps-receiver.webp',
    alt: 'USB GPS Receiver – Plug-and-Play High Sensitivity Location Dongle',
    folder: '/rmax/products/usb-gps-receiver/main'
  },
  {
    slug: 'gps-trackers',
    sourceFile: 'C:/Users/busin/.gemini/antigravity/brain/1c8d5b88-4b89-4be7-a527-33ead3829568/rmax_vehicle_gps_tracker_1794805976790.jpg',
    localDestJpg: 'scripts/product-photos/gps-trackers.jpg',
    localDestWebp: 'scripts/product-photos/gps-trackers.webp',
    alt: 'GPS Trackers – Real-Time Vehicle & Fleet Tracking Device',
    folder: '/rmax/products/gps-trackers/main'
  }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');
  const col = mongoose.connection.collection('products');

  for (const item of GPS_ASSETS) {
    console.log(`\nProcessing ${item.slug}...`);
    if (!fs.existsSync(item.sourceFile)) {
      console.error(`Source file missing: ${item.sourceFile}`);
      continue;
    }

    // 1. Copy source to scripts/product-photos/
    fs.copyFileSync(item.sourceFile, item.localDestJpg);
    console.log(`Saved local copy: ${item.localDestJpg}`);

    // 2. Convert to high-quality WebP (1200x1200)
    const webpBuf = await sharp(item.sourceFile)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 92, effort: 5 })
      .toBuffer();

    fs.writeFileSync(item.localDestWebp, webpBuf);
    console.log(`Saved local WebP: ${item.localDestWebp}`);

    const meta = await sharp(webpBuf).metadata();
    const fileName = `${item.slug}-hd-${Date.now()}.webp`;

    // 3. Upload to ImageKit
    console.log(`Uploading to ImageKit: ${item.folder}/${fileName}...`);
    const uploaded = await ik.upload({
      file: webpBuf,
      fileName,
      folder: item.folder,
      useUniqueFileName: true,
    });

    console.log(`Uploaded successfully! CDN URL: ${uploaded.url}`);

    // 4. Update Product in MongoDB
    const primaryImage = {
      src: uploaded.url,
      alt: item.alt,
      width: meta.width || 1024,
      height: meta.height || 1024,
    };

    const imgDoc = {
      fileId: uploaded.fileId,
      url: uploaded.url,
      filePath: uploaded.filePath,
      type: 'main',
      alt: item.alt,
      isPrimary: true,
      sortOrder: 0,
      width: meta.width || 1024,
      height: meta.height || 1024,
    };

    const galItem = {
      src: uploaded.url,
      thumb: uploaded.url,
      alt: item.alt,
      kind: 'image',
    };

    const result = await col.updateOne(
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

    console.log(`Updated MongoDB for ${item.slug} (matched: ${result.matchedCount}, modified: ${result.modifiedCount})`);
  }

  console.log('\nAll GPS images upscaled, converted to WebP, uploaded to ImageKit, and updated in MongoDB!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
