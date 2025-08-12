import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
    cloud_name: config.cloudinary.cloudName!,
    api_key: config.cloudinary.apiKey!,
    api_secret: config.cloudinary.secret!,
    secure: true,
});

export const uploadFile = async (path: string) => {
    return await cloudinary.uploader.upload(path, {
        folder: "nexevent/articles",
    });
}

export const destroyFile = async (imageId: string) => {
    return await cloudinary.uploader.destroy(imageId, { type: "authenticated" });
}

export default cloudinary;