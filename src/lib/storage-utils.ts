import { supabase } from "./supabase";

/**
 * Uploads a base64 string or File to Supabase Storage and returns the public URL.
 * @param path The path in storage (e.g., 'profiles/uid/avatar.jpg')
 * @param data The base64 string (with data:image/... prefix) or File object
 * @returns The download URL
 */
export async function uploadImage(path: string, data: string | File): Promise<string> {
  const bucket = "uploads"; // Default bucket name
  
  let fileBody: File | Buffer | Blob | ArrayBuffer | string = data;

  if (typeof data === 'string' && data.includes(',')) {
    // Convert base64 to Blob
    const parts = data.split(',');
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    fileBody = new Blob([ab], { type: mimeString });
  }

  let { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, fileBody, {
      upsert: true
    });

  if (uploadError) {
    if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("does not exist")) {
      console.warn("Bucket not found. Attempting to create...");
      await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      const retry = await supabase.storage
        .from(bucket)
        .upload(path, fileBody, {
          upsert: true
        });
      uploadError = retry.error;
      uploadData = retry.data;
    }

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw uploadError;
    }
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

/** Largest image a reseller may upload for logo, banner or profile picture. */
export const RESELLER_IMAGE_MAX_BYTES = 50 * 1024 * 1024;

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  const fromType = file.type.split("/")[1]?.replace("svg+xml", "svg").replace("jpeg", "jpg");
  return fromType || "jpg";
}

/**
 * Uploads a reseller image asset (avatar, logo, or banner) to storage at its
 * original quality and returns the public URL. iPhone HEIC photos are converted
 * to JPEG so every browser can show them; nothing else is resized or compressed.
 * Throws a readable error if the upload fails, so the caller can tell the user.
 */
export async function uploadResellerAsset(
  userId: string,
  assetType: "avatar" | "logo" | "banner",
  fileOrBase64: File | string,
  _maxDim = 0
): Promise<string> {
  if (typeof fileOrBase64 === "string") {
    if (fileOrBase64.startsWith("http")) return fileOrBase64;
    const ext = fileOrBase64.match(/^data:image\/([a-z0-9+]+)/)?.[1]?.replace("svg+xml", "svg").replace("jpeg", "jpg") || "jpg";
    return uploadImage(`resellers/${userId || "anonymous"}/${assetType}_${Date.now()}.${ext}`, fileOrBase64);
  }

  const file = await convertHeicIfNeeded(fileOrBase64);
  const filePath = `resellers/${userId || "anonymous"}/${assetType}_${Date.now()}.${extensionFor(file)}`;

  const { error } = await supabase.storage.from("uploads").upload(filePath, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
  });
  if (error) {
    throw new Error(error.message || "Upload failed. Please check your connection and try again.");
  }
  return supabase.storage.from("uploads").getPublicUrl(filePath).data.publicUrl;
}

/**
 * Compresses an image file to a base64 string.
 * This is useful for storing images directly in Firestore to bypass Storage rules.
 * The image is resized to max 800x800 and compressed to JPEG with 0.6 quality.
 */
export async function compressImageToBase64(file: File, maxDim = 1000): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("[IMAGE_COMPRESS] Image processing timed out, using raw reader result");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }, 8000);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        clearTimeout(timeout);
        resolve(null);
        return;
      }

      // If already small SVG or GIF or under 300KB, return as-is
      if (file.type === "image/svg+xml" || file.type === "image/gif" || file.size < 300 * 1024) {
        clearTimeout(timeout);
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          const MAX_WIDTH = maxDim;
          const MAX_HEIGHT = maxDim;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        } catch (err) {
          console.warn("[IMAGE_COMPRESS] Error during canvas processing, fallback to raw base64:", err);
          resolve(result);
        }
      };
      img.onerror = (err) => {
        clearTimeout(timeout);
        console.warn("[IMAGE_COMPRESS] Image load error, fallback to raw base64:", err);
        resolve(result);
      };
      img.src = result;
    };
    reader.onerror = (err) => {
      clearTimeout(timeout);
      console.error("[IMAGE_COMPRESS] FileReader error:", err);
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}

/** Converts HEIC/HEIF photos (iPhone) to JPEG so every browser can display them. */
export async function convertHeicIfNeeded(file: File): Promise<File> {
  const name = file.name.toLowerCase();
  const isHeic = /image\/hei[cf]/.test(file.type) || name.endsWith(".heic") || name.endsWith(".heif");
  if (!isHeic) return file;
  try {
    const { default: heic2any } = await import("heic2any");
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const blob = Array.isArray(out) ? out[0] : out;
    return new File([blob], name.replace(/\.hei[cf]$/, ".jpg"), { type: "image/jpeg" });
  } catch (err) {
    console.warn("[HEIC] Conversion failed, uploading original:", err);
    return file;
  }
}
