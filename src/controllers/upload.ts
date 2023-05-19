import { Request, Response, NextFunction } from 'express';
import { handleFileUpload } from '../utils/multer';
import { asyncMiddleware, classResponse, sendResponse } from '../utils/utils';
import AWS from 'aws-sdk';
import multer from 'multer';
import dotenv from 'dotenv';
import { NameRequest } from '../interfaces/custom-request';
import { Relative } from '../schema/relative';
import { ObjectId } from 'mongodb';

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
    const { photo, name, relationship } = await handleFileUpload(req, res);
    const { buffer, mimetype } = photo;
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const key = `${BUCKET_FOLDER}/${fileName}`;

    const encodedName = encodeURIComponent(name);
    const encodedRelationship = encodeURIComponent(relationship);
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      Metadata: {
        'FullName': JSON.stringify(req.user),
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
    // Handle the error here\
    next(err);
  }
});


interface ClassResponse {
  success: boolean;
  data: any;
  error: string | null;
}

export const storeRelativeImage = (photo: any, user: string): Promise<ClassResponse> => {
  const { buffer, mimetype } = photo;
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const key = `${BUCKET_FOLDER}/${fileName}`;
  const params: AWS.S3.PutObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    Metadata: {
      'FullName': JSON.stringify(user),
    },
  };

  return new Promise<ClassResponse>((resolve) => {
    s3.upload(params, function (err: AWS.AWSError, data: AWS.S3.ManagedUpload.SendData) {
      if (err) {
        console.log("Error uploading file to S3: ", err);
        resolve({ success: false, data: null, error: "Error uploading file" });
      } else {
        console.log("File uploaded to S3: ", data.Location);
        resolve({ success: true, data: data.Location, error: null });
      }
    });
  });
};


// Function to find a relative in the Relative collection based on ID


// Function to find a relative in the Relative collection based on ID
// Function to find a relative in the Relative collection based on ID
const findRelativeById = async (id: string) => {
  console.log('Finding relative by ID:', id);
  try {
    const relative = await Relative.findById({
      _id: id,
    });
    console.log('Found relative:', relative);
    if (relative) {
      return relative;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

// Modify verifyImage function to include finding the relative
export const verifyImage = asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photo } = await handleFileUpload(req, res);
    const { buffer } = photo;

    const response = await rekognition.searchFacesByImage({
      CollectionId: 'famouspersons',
      Image: { Bytes: buffer },
    }).promise();

    let personDetails: any = null;
    let found: boolean = false;

    for (const match of response.FaceMatches) {
      const face = await dynamodb.getItem({
        TableName: 'face_recognition',
        Key: { RekognitionId: { S: match.Face.FaceId } },
      }).promise();

      if (face.Item && face.Item.FullName && face.Item.FullName.S) {
        const details = face.Item.FullName.S;

        try {
          personDetails = JSON.parse(details);
          found = true;
          break; // Exit the loop if a match is found
        } catch (error) {
          console.error('Error parsing person details:', error);
        }
      }
    }

    if (!found) {
      console.log('Person cannot be recognized');
      res.status(200).json({ success: false, data: null, error: null });
      return;
    }
    console.log('Person recognized:', typeof personDetails);

    personDetails = JSON.parse(personDetails);

    if (personDetails?.id !== undefined) {
      const relative = await findRelativeById(personDetails.id);

      if (!relative) {
        console.log('Relative not found');
        res.status(200).json({ success: false, data: null, error: null });
        return;
      }

      const personData = {
        id: relative._id,
        name: relative.name,
        relationship: relative.relationship,
        photoUrl: relative.photoUrl,
      };

      res.status(200).json({ success: true, data: personData, error: null });
    } else {
      res.status(200).json({ success: false, data: null, error: null });
    }
  } catch (error) {
    console.error('Error recognizing face:', error);
    res.status(500).send('Error recognizing face');
  }
});



export const deleteAllImages = asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listParams: AWS.S3.ListObjectsRequest = {
      Bucket: BUCKET_NAME,
      Prefix: BUCKET_FOLDER
    };

    const listObjectsResponse = await s3.listObjects(listParams).promise();

    if (!listObjectsResponse.Contents || listObjectsResponse.Contents.length === 0) {
      console.log('No objects found in the S3 bucket.');
      return;
    }

    const deleteParams: AWS.S3.DeleteObjectsRequest = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: []
      }
    };

    listObjectsResponse.Contents.forEach((content) => {
      deleteParams.Delete.Objects.push({ Key: content.Key! });
    });

    const deleteResponse = await s3.deleteObjects(deleteParams).promise();

    console.log('Deleted objects:');
    deleteResponse.Deleted?.forEach((deletedObject) => {
      console.log(deletedObject.Key);
    });

    res.status(200).json({ success: true, data: null, error: null });
  } catch (error) {
    console.error('Error deleting objects from S3:', error);
    res.status(500).send('Error deleting objects from S3');
  }
})
