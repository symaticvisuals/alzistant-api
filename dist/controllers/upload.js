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
exports.verifyImage = exports.addImage = void 0;
const multer_1 = require("../utils/multer");
const utils_1 = require("../utils/utils");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_2 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
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
    console.log(req.name);
    try {
        const { photo, name } = yield (0, multer_1.handleFileUpload)(req, res);
        const { buffer, mimetype } = photo;
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const key = `${BUCKET_FOLDER}/${fileName}`;
        console.log("name", name);
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
            Metadata: {
                'FullName': name,
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
        // Handle the error here
    }
}));
exports.verifyImage = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { photo } = yield (0, multer_1.handleFileUpload)(req, res);
        const { buffer } = photo;
        const response = yield rekognition.searchFacesByImage({
            CollectionId: 'famouspersons',
            Image: { Bytes: buffer },
        }).promise();
        let name = null;
        let found = false;
        for (const match of response.FaceMatches) {
            console.log(match.Face.FaceId, match.Face.Confidence);
            const face = yield dynamodb.getItem({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error recognizing face');
    }
}));
