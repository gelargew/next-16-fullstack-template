import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
let storage: Storage;

function getStorage(): Storage {
  if (!storage) {
    const serviceAccountJson = process.env.GCS_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('GCS_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    // Parse the service account JSON (it might be base64 encoded or raw JSON)
    let credentials;
    try {
      // Try parsing as base64 first
      const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf8');
      credentials = JSON.parse(decoded);
    } catch {
      // If base64 fails, try parsing as raw JSON
      try {
        credentials = JSON.parse(serviceAccountJson);
      } catch (error) {
        throw new Error('Invalid GCS_SERVICE_ACCOUNT_JSON format. Expected base64 encoded JSON or raw JSON string.');
      }
    }

    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials,
    });
  }
  return storage;
}

export async function uploadToGCS(
  buffer: Buffer,
  filename: string,
  contentType: string = 'image/webp'
): Promise<string> {
  try {
    const gcs = getStorage();
    const bucket = gcs.bucket(process.env.GCS_BUCKET!);

    // Use the filename as provided (UUID is generated in the API)
    const uniqueFilename = filename;

    const file = bucket.file(uniqueFilename);

    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
      // Don't set predefinedAcl when uniform bucket-level access is enabled
      // The bucket should be configured for public access instead
    });

    // Return the public URL
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${uniqueFilename}`;

  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error('Failed to upload file to Google Cloud Storage');
  }
}

export async function deleteFromGCS(filename: string): Promise<void> {
  try {
    const gcs = getStorage();
    const bucket = gcs.bucket(process.env.GCS_BUCKET!);
    const file = bucket.file(filename);

    await file.delete();

  } catch (error) {
    console.error('Error deleting from GCS:', error);
    throw new Error('Failed to delete file from Google Cloud Storage');
  }
}