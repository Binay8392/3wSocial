const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const isCloudinaryConfigured = () => {
  return Boolean(cloudName && apiKey && apiSecret);
};

const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured.'));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: '3w-social',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || 'Image upload failed.'));
        }

        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary did not return a valid image URL.'));
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

module.exports = { cloudinary, isCloudinaryConfigured, uploadImage };
