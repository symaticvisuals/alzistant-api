import { Request, Response, NextFunction } from 'express';
import { handleFileUpload } from '../utils/multer';
import { asyncMiddleware } from '../utils/utils';
import AWS from 'aws-sdk';
import multer from 'multer';
import dotenv from 'dotenv';
import { NameRequest } from '../interfaces/custom-request';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_API_KEY!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
});

const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.S3_API_KEY!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  region: 'us-east-1',
});

const dynamodb = new AWS.DynamoDB({
  accessKeyId: process.env.S3_API_KEY!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  region: 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const BUCKET_FOLDER = process.env.S3_FOLDER_NAME!;
const storage = multer.memoryStorage();

export const addImage = asyncMiddleware(async (req: NameRequest, res: Response, next: NextFunction) => {
 
  try {
    const { photo, name } = await handleFileUpload(req, res);
    const { buffer, mimetype } = photo;
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const key = `${BUCKET_FOLDER}/${fileName}`;
   
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      Metadata: {
        'FullName': name,
      },
    };

    s3.upload(params, function (err: AWS.AWSError, data: AWS.S3.ManagedUpload.SendData) {
      if (err) {
        console.log("Error uploading file to S3: ", err);
        res.status(500).json({ success: false, data: null, error: "Error uploading file" });
      } else {
        console.log("File uploaded to S3: ", data.Location);
        res.status(200).json({ success: true, data: data.Location, error: null });
      }
    });
  } catch (err) {
    // Handle the error here
  }
});

export const verifyImage = asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photo } = await handleFileUpload(req, res);
    const { buffer } = photo;
    const response = await rekognition.searchFacesByImage({
      CollectionId: 'famouspersons',
      Image: { Bytes: buffer },
    }).promise();
    let name: string | null = null;
    let found: boolean = false;
    for (const match of response.FaceMatches) {
     
      const face = await dynamodb.getItem({
        TableName: 'face_recognition',
        Key: { RekognitionId: { S: match.Face.FaceId } },
      }).promise();
      if (face.Item) {
        console.log('Found Person:', face.Item.FullName.S);
        name = face.Item.FullName.S;
        found = true;
      }
    }

    if (!found) {
      console.log('Person cannot be recognized');
      res.status(200).json({ success: false, data: null, error: null });
      return;
    }
    res.status(200).json({ success: true, data: name, error: null });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error recognizing face');
  }
})