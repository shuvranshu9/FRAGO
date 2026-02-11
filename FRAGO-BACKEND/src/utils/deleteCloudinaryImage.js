import { v2 as cloudinary } from 'cloudinary';

export function extractPublicId(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; 
    const parts = pathname.split('/').filter(Boolean);

    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return null;

    // Everything after "upload" and remove version if exists
    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0]?.match(/^v\d+$/)) publicIdParts.shift();

    // Remove file extension from last part
    const last = publicIdParts.pop();
    publicIdParts.push(last.replace(/\.[^/.]+$/, ''));

    return publicIdParts.join('/');
  } catch (err) {
    console.error('Invalid Cloudinary URL:', url);
    return null;
  }
}

export async function deleteFromCloudinaryByUrl(imageUrl) {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    console.log('Deleted from Cloudinary:', publicId, result);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
}
