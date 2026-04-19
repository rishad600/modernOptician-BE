import axios from 'axios';
import config from '../config/config.js';

/**
 * Uploads a file to Bunny.net Storage
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - The name to save the file as
 * @param {string} folder - The folder path in the storage zone (e.g., 'blogs')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadFile = async (fileBuffer, fileName, folder = 'blogs') => {
  const { storageZoneName, storageAccessKey, storagePullZoneUrl } = config.bunny;

  if (!storageZoneName || !storageAccessKey || !storagePullZoneUrl) {
    throw new Error('Bunny Storage configuration is missing');
  }

  // Normalize folder path: remove leading/trailing slashes
  const cleanFolder = folder.replace(/^\/|\/$/g, '');
  const path = `${cleanFolder}/${Date.now()}-${fileName}`;
  const url = `https://storage.bunnycdn.com/${storageZoneName}/${path}`;
  try {
    await axios.put(url, fileBuffer, {
      headers: {
        AccessKey: storageAccessKey,
        'Content-Type': 'application/octet-stream',
      },
    });

    // Construct the public URL
    // Ensure pull zone URL ends with a slash
    const baseUrl = storagePullZoneUrl.endsWith('/') ? storagePullZoneUrl : `${storagePullZoneUrl}/`;
    return `${baseUrl}${path}`;
  } catch (error) {
    console.error('Bunny Storage Upload Error:', error.response?.data || error.message);
    throw new Error('Failed to upload image to storage');
  }
};

export default {
  uploadFile,
};
