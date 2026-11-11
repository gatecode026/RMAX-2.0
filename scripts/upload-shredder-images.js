require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const ImageKit = require('imagekit');

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadToImageKit() {
  const uploads = [
    {
      filePath: 'shredder_main.jpg',
      fileName: 'plastic-waste-shredder-machine-main',
      folder: '/rmax/products/plastic-waste-shredder-machine/main',
      type: 'main',
      isPrimary: true,
      alt: 'RMAX Plastic Waste Shredder Machine Model 100 with Stainless Steel Weighing Accessories'
    },
    {
      filePath: 'shredder_cutting_chamber.jpg',
      fileName: 'plastic-waste-shredder-cutting-chamber',
      folder: '/rmax/products/plastic-waste-shredder-machine/gallery',
      type: 'gallery',
      isPrimary: false,
      alt: 'RMAX Plastic Waste Shredder Machine – 4 Rotary & 2 Stationary Blade Chamber with Flywheel'
    },
    {
      filePath: 'shredder_motor_drive.jpg',
      fileName: 'plastic-waste-shredder-motor-drive',
      folder: '/rmax/products/plastic-waste-shredder-machine/gallery',
      type: 'gallery',
      isPrimary: false,
      alt: 'RMAX Plastic Waste Shredder Machine – 10 HP Motor and Belt Drive Mechanism'
    },
    {
      filePath: 'shredder_catalogue_unit_clean.jpg',
      fileName: 'plastic-waste-shredder-catalogue-unit',
      folder: '/rmax/products/plastic-waste-shredder-machine/gallery',
      type: 'gallery',
      isPrimary: false,
      alt: 'RMAX Plastic Waste Shredder Machine – Workshop Processing Unit'
    },
    {
      filePath: 'shredder_thumb.webp',
      fileName: 'plastic-waste-shredder-thumb',
      folder: '/rmax/products/plastic-waste-shredder-machine/thumbnails',
      type: 'thumbnail',
      isPrimary: false,
      alt: 'RMAX Plastic Waste Shredder Machine Model 100 Thumbnail'
    }
  ];

  const results = [];

  for (const item of uploads) {
    const fileBuf = fs.readFileSync(item.filePath);
    console.log('Uploading', item.fileName, 'to', item.folder, '...');
    const res = await ik.upload({
      file: fileBuf,
      fileName: item.fileName,
      folder: item.folder,
      useUniqueFileName: false
    });
    console.log('Uploaded successfully:', res.name, res.url);
    results.push({
      fileId: res.fileId,
      url: res.url,
      filePath: res.filePath,
      name: res.name,
      width: res.width,
      height: res.height,
      size: res.size,
      type: item.type,
      isPrimary: item.isPrimary,
      alt: item.alt
    });
  }

  fs.writeFileSync('imagekit_shredder_uploaded.json', JSON.stringify(results, null, 2));
  console.log('All ImageKit assets uploaded and metadata saved to imagekit_shredder_uploaded.json');
}

uploadToImageKit().catch(err => {
  console.error('Upload error:', err);
  process.exit(1);
});
