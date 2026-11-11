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
      filePath: 'bailing_main.jpg',
      fileName: 'plastic-bailing-machine-main',
      folder: '/rmax/products/plastic-bailing-machine/main',
      type: 'main',
      isPrimary: true,
      alt: 'RMAX Plastic Bailing Machine Hydraulic Vertical Baler'
    },
    {
      filePath: 'bailing_chamber_doors.jpg',
      fileName: 'plastic-bailing-machine-chamber-doors',
      folder: '/rmax/products/plastic-bailing-machine/gallery',
      type: 'gallery',
      isPrimary: false,
      alt: 'RMAX Plastic Bailing Machine – Twin-Door Chamber and Dual Rope Ties'
    },
    {
      filePath: 'bailing_hydraulic_powerpack.jpg',
      fileName: 'plastic-bailing-machine-hydraulic-powerpack',
      folder: '/rmax/products/plastic-bailing-machine/gallery',
      type: 'gallery',
      isPrimary: false,
      alt: 'RMAX Plastic Bailing Machine – 7.5 HP Motor and Hydraulic Gear-cum-Plunger Pump'
    },
    {
      filePath: 'bailing_catalogue_unit_clean.jpg',
      fileName: 'plastic-bailing-machine-catalogue-unit',
      folder: '/rmax/products/plastic-bailing-machine/gallery',
      type: 'gallery',
      isPrimary: false,
      alt: 'RMAX Plastic Bailing Machine – Industrial Vertical Baler Unit'
    },
    {
      filePath: 'bailing_thumb.webp',
      fileName: 'plastic-bailing-machine-thumb',
      folder: '/rmax/products/plastic-bailing-machine/thumbnails',
      type: 'thumbnail',
      isPrimary: false,
      alt: 'RMAX Plastic Bailing Machine Thumbnail'
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

  fs.writeFileSync('imagekit_bailing_uploaded.json', JSON.stringify(results, null, 2));
  console.log('All ImageKit assets uploaded and metadata saved to imagekit_bailing_uploaded.json');
}

uploadToImageKit().catch(err => {
  console.error('Upload error:', err);
  process.exit(1);
});

