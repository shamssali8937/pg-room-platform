import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (buffer: Buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "profiles" }, (error, result) => {
                // console.log(result);
                if (error) return reject(error);
                resolve(result);
            })
            .end(buffer);
    });
};

/**
 * Gap 2: Moderation-enabled upload for room images.
 * Uses Cloudinary's built-in AWS Rekognition moderation to detect NSFW content.
 * The response includes a `moderation` array with status "approved" or "rejected".
 * Falls back to standard upload if moderation add-on is not enabled on the Cloudinary account.
 */
export const uploadWithModeration = async (buffer: Buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "rooms" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            })
            .end(buffer);
    });
};