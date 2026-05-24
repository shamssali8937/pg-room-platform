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