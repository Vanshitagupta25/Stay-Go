const cloudinary = require('cloudinary').v2;
const { application } = require('express');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECERET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};