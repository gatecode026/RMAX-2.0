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

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('products');
  const slug = 'push-button-sanitary-napkin-vending-machine';

  const mediaList = [
    { file: 'src/images/20260123_131254.jpg', type: 'main', alt: 'Push-Button Sanitary Napkin Vending Machine – One-Touch Dispenser' },
    { file: 'src/images/20260123_131312.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Side Wall Mount Perspective' },
    { file: 'src/images/20260123_131331.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Dispensing Shutter View' },
    { file: 'src/images/20260123_131421.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Mechanical Coil Mechanism' },
    { file: 'public/images/products/catalog/manual-vending-catalog.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Catalog Product View' },
  ];

  const galleryItems = [];
  const imagesItems = [];
  let primaryImage = null;

  for (let i = 0; i < mediaList.length; i++) {
    const { file, type, alt } = mediaList[i];
    const baseName = path.basename(file, path.extname(file));
    const webpBuf = await sharp(file)
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();

    const meta = await sharp(webpBuf).metadata();
    const folder = '/rmax/products/' + slug + '/' + (type === 'main' ? 'main' : 'gallery');
    const fileName = slug + '-' + baseName + '-' + Date.now() + '.webp';

    const uploaded = await ik.upload({
      file: webpBuf,
      fileName,
      folder,
      useUniqueFileName: true,
    });

    console.log('Uploaded ->', uploaded.url);

    const imgDoc = {
      fileId: uploaded.fileId,
      url: uploaded.url,
      filePath: uploaded.filePath,
      type: type === 'main' ? 'main' : 'gallery',
      alt,
      isPrimary: type === 'main' || i === 0,
      sortOrder: i,
      width: meta.width || 800,
      height: meta.height || 800,
    };
    imagesItems.push(imgDoc);

    const galItem = {
      src: uploaded.url,
      thumb: uploaded.url,
      alt,
      kind: 'image',
    };
    galleryItems.push(galItem);

    if (type === 'main' || i === 0) {
      primaryImage = {
        src: uploaded.url,
        alt,
        width: meta.width || 800,
        height: meta.height || 800,
      };
    }
  }

  await col.updateOne({ slug }, {
    $set: {
      gallery: galleryItems,
      images: imagesItems,
      image: primaryImage,
      cardImage: primaryImage,
      portraitImage: primaryImage,
      listImage: primaryImage,
      overviewImage: primaryImage,
    }
  });

  console.log('Successfully updated push-button-sanitary-napkin-vending-machine gallery with all 5 images!');
  await mongoose.disconnect();
}

run().catch(console.error);
