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
exports.verifyUser = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const oAuth2Client = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});
const verifyUser = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    oAuth2Client.setCredentials({ access_token: accessToken });
    let userDetails = yield getUserDetails();
    return userDetails;
});
exports.verifyUser = verifyUser;
function getUserDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        const people = googleapis_1.google.people({ version: "v1", auth: oAuth2Client });
        const userProfile = yield people.people.get({
            resourceName: "people/me",
            personFields: "emailAddresses,names,photos",
        });
        const userDetails = {
            email: userProfile.data.emailAddresses[0].value,
            name: userProfile.data.names[0].displayName,
            photoUrl: userProfile.data.photos[0].url,
        };
        return userDetails;
    });
}
