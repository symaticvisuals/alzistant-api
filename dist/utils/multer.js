"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFileUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const utils_1 = require("./utils");
const upload = (0, multer_1.default)().single('photo');
exports.upload = upload;
const handleFileUpload = (req, res) => {
    return new Promise((resolve, reject) => {
        upload(req, res, function (err) {
            if (err) {
                console.log("Error uploading file: ", err);
                (0, utils_1.sendResponse)(res, {
                    status: 200,
                    success: false,
                    data: null,
                    error: err
                });
                reject(err);
            }
            else {
                const photo = req.file;
                const name = req.body.name;
                const relationship = req.body.relationship;
                resolve({ photo, name, relationship });
            }
        });
    });
};
exports.handleFileUpload = handleFileUpload;
