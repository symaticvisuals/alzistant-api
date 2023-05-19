"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllImages = exports.verifyImage = exports.storeRelativeImage = exports.addImage = void 0;
const multer_1 = require("../utils/multer");
const utils_1 = require("../utils/utils");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_2 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const relative_1 = require("../schema/relative");
dotenv_1.default.config();
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.S3_API_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});
const rekognition = new aws_sdk_1.default.Rekognition({
    accessKeyId: process.env.S3_API_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});
const dynamodb = new aws_sdk_1.default.DynamoDB({
    accessKeyId: process.env.S3_API_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const BUCKET_FOLDER = process.env.S3_FOLDER_NAME;
const storage = multer_2.default.memoryStorage();
exports.addImage = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { photo, name, relationship } = yield (0, multer_1.handleFileUpload)(req, res);
        const { buffer, mimetype } = photo;
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const key = `${BUCKET_FOLDER}/${fileName}`;
        const encodedName = encodeURIComponent(name);
        const encodedRelationship = encodeURIComponent(relationship);
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
            Metadata: {
                'FullName': JSON.stringify(req.user),
            },
        };
        s3.upload(params, function (err, data) {
            if (err) {
                console.log("Error uploading file to S3: ", err);
                res.status(500).json({ success: false, data: null, error: "Error uploading file" });
            }
            else {
                console.log("File uploaded to S3: ", data.Location);
                res.status(200).json({ success: true, data: data.Location, error: null });
            }
        });
    }
    catch (err) {
        // Handle the error here\
        next(err);
    }
}));
const storeRelativeImage = (photo, user) => {
    const { buffer, mimetype } = photo;
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const key = `${BUCKET_FOLDER}/${fileName}`;
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        Metadata: {
            'FullName': JSON.stringify(user),
        },
    };
    return new Promise((resolve) => {
        s3.upload(params, function (err, data) {
            if (err) {
                console.log("Error uploading file to S3: ", err);
                resolve({ success: false, data: null, error: "Error uploading file" });
            }
            else {
                console.log("File uploaded to S3: ", data.Location);
                resolve({ success: true, data: data.Location, error: null });
            }
        });
    });
};
exports.storeRelativeImage = storeRelativeImage;
// Function to find a relative in the Relative collection based on ID
// Function to find a relative in the Relative collection based on ID
// Function to find a relative in the Relative collection based on ID
const findRelativeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Finding relative by ID:', id);
    try {
        const relative = yield relative_1.Relative.findById({
            _id: id,
        });
        console.log('Found relative:', relative);
        if (relative) {
            return relative;
        }
        return null;
    }
    catch (error) {
        console.log(error);
    }
});
// Modify verifyImage function to include finding the relative
exports.verifyImage = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { photo } = yield (0, multer_1.handleFileUpload)(req, res);
        const { buffer } = photo;
        const response = yield rekognition.searchFacesByImage({
            CollectionId: 'famouspersons',
            Image: { Bytes: buffer },
        }).promise();
        let personDetails = null;
        let found = false;
        for (const match of response.FaceMatches) {
            const face = yield dynamodb.getItem({
                TableName: 'face_recognition',
                Key: { RekognitionId: { S: match.Face.FaceId } },
            }).promise();
            if (face.Item && face.Item.FullName && face.Item.FullName.S) {
                const details = face.Item.FullName.S;
                try {
                    personDetails = JSON.parse(details);
                    found = true;
                    break; // Exit the loop if a match is found
                }
                catch (error) {
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
        if ((personDetails === null || personDetails === void 0 ? void 0 : personDetails.id) !== undefined) {
            const relative = yield findRelativeById(personDetails.id);
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
        }
        else {
            res.status(200).json({ success: false, data: null, error: null });
        }
    }
    catch (error) {
        console.error('Error recognizing face:', error);
        res.status(500).send('Error recognizing face');
    }
}));
exports.deleteAllImages = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const listParams = {
            Bucket: BUCKET_NAME,
            Prefix: BUCKET_FOLDER
        };
        const listObjectsResponse = yield s3.listObjects(listParams).promise();
        if (!listObjectsResponse.Contents || listObjectsResponse.Contents.length === 0) {
            console.log('No objects found in the S3 bucket.');
            return;
        }
        const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: {
                Objects: []
            }
        };
        listObjectsResponse.Contents.forEach((content) => {
            deleteParams.Delete.Objects.push({ Key: content.Key });
        });
        const deleteResponse = yield s3.deleteObjects(deleteParams).promise();
        console.log('Deleted objects:');
        (_a = deleteResponse.Deleted) === null || _a === void 0 ? void 0 : _a.forEach((deletedObject) => {
            console.log(deletedObject.Key);
        });
        res.status(200).json({ success: true, data: null, error: null });
    }
    catch (error) {
        console.error('Error deleting objects from S3:', error);
        res.status(500).send('Error deleting objects from S3');
    }
}));
