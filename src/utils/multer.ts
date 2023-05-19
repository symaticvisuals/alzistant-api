import multer from 'multer';
import { Request, Response } from 'express';
import { sendResponse } from './utils';

const upload = multer().single('photo');

interface UploadedPhoto {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

interface FileUploadResult {
    photo: UploadedPhoto;
    name: string;
    relationship: string;
}

const handleFileUpload = (req: any, res: Response): Promise<FileUploadResult> => {
    return new Promise((resolve, reject) => {
        upload(req, res, function (err: any) {
            if (err) {
                console.log("Error uploading file: ", err);
                sendResponse(res, {
                    status: 200,
                    success: false,
                    data: null,
                    error: err
                });
                reject(err);
            } else {
                const photo = req.file as UploadedPhoto;
                const name = req.body.name as string;
                const relationship = req.body.relationship as string;
                resolve({ photo, name, relationship });
            }
        });
    });
};


export {
    upload,
    handleFileUpload
};