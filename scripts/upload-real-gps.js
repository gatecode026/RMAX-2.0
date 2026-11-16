const fs = require('fs');
const ImageKit = require('imagekit');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadAndSync() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const col = mongoose.connection.collection('products');

  const photos = [
    {
      key: 'front',
      file: 'scripts/product-photos/usb-gps-front-final.webp',
      fileName: 'geosat-gps-85-front.webp',
      alt: 'GEOSAT GPS 8.5 USB GPS Receiver - Front View with Make in India Emblem',
      width: 920,
      height: 1280
    },
    {
      key: 'side',
      file: 'scripts/product-photos/usb-gps-side-final.webp',
      fileName: 'geosat-gps-85-side.webp',
      alt: 'GEOSAT GPS 8.5 USB GPS Receiver - Side Profile with Antenna Port',
      width: 920,
      height: 1280
    },
    {
      key: 'back',
      file: 'scripts/product-photos/usb-gps-back-final.webp',
      fileName: 'geosat-gps-85-back.webp',
      alt: 'GEOSAT GPS 8.5 USB GPS Receiver - Back View with Model and Batch Specifications',
      width: 920,
      height: 1280
    },
    {
      key: 'top',
      file: 'scripts/product-photos/usb-gps-top-final.webp',
      fileName: 'geosat-gps-85-top.webp',
      alt: 'GEOSAT GPS 8.5 USB GPS Receiver - Top View with USB Port',
      width: 920,
      height: 720
    }
  ];

  const uploadedAssets = [];
  for (const item of photos) {
    console.log('Uploading', item.fileName, 'to ImageKit...');
    const buf = fs.readFileSync(item.file);
    const res = await ik.upload({
      file: buf,
      fileName: item.fileName,
      folder: '/rmax/products/usb-gps-receiver',
      useUniqueFileName: true
    });
    console.log('Uploaded:', res.url);
    uploadedAssets.push({
      ...item,
      url: res.url,
      fileId: res.fileId,
      filePath: res.filePath
    });
  }

  // Primary image is front
  const primary = uploadedAssets[0];
  const primaryImgObj = {
    src: primary.url,
    alt: primary.alt,
    width: primary.width,
    height: primary.height
  };

  const imagesArray = uploadedAssets.map((u, i) => ({
    fileId: u.fileId,
    url: u.url,
    filePath: u.filePath,
    type: i === 0 ? 'main' : 'gallery',
    alt: u.alt,
    isPrimary: i === 0,
    sortOrder: i,
    width: u.width,
    height: u.height
  }));

  const galleryArray = uploadedAssets.map(u => ({
    src: u.url,
    thumb: u.url,
    alt: u.alt,
    kind: 'image'
  }));

  // Update usb-gps-receiver
  const r1 = await col.updateOne(
    { slug: 'usb-gps-receiver' },
    {
      $set: {
        image: primaryImgObj,
        cardImage: primaryImgObj,
        overviewImage: primaryImgObj,
        images: imagesArray,
        gallery: galleryArray
      }
    }
  );
  console.log('Updated usb-gps-receiver:', r1.modifiedCount);

  // Update gps-trackers
  const r2 = await col.updateOne(
    { slug: 'gps-trackers' },
    {
      $set: {
        image: primaryImgObj,
        cardImage: primaryImgObj,
        overviewImage: primaryImgObj,
        images: imagesArray,
        gallery: galleryArray
      }
    }
  );
  console.log('Updated gps-trackers:', r2.modifiedCount);

  // Also update local webp files
  fs.copyFileSync('scripts/product-photos/usb-gps-front-final.webp', 'scripts/product-photos/usb-gps-receiver.webp');
  fs.copyFileSync('scripts/product-photos/usb-gps-front-final.webp', 'scripts/product-photos/gps-trackers.webp');
  console.log('Saved local product-photos webp copies');

  await mongoose.disconnect();
  console.log('Done!');
}

uploadAndSync().catch(err => {
  console.error(err);
  process.exit(1);
});
