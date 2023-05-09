import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const verifyUser = async (accessToken: string) => {
  oAuth2Client.setCredentials({ access_token: accessToken });
  let userDetails = await getUserDetails();
  return userDetails;
};

async function getUserDetails() {
  const people = google.people({ version: "v1", auth: oAuth2Client });
  const userProfile = await people.people.get({
    resourceName: "people/me",
    personFields: "emailAddresses,names,photos",
  });
  const userDetails = {
    email: userProfile.data.emailAddresses[0].value,
    name: userProfile.data.names[0].displayName,
    photoUrl: userProfile.data.photos[0].url,
  };
  return userDetails;
}

export { verifyUser };
