import { Request, Response, NextFunction } from "express";
import { asyncMiddleware, generateJwtToken, sendResponse } from "../utils/utils";
import { verifyUser } from "../services/gAuth";
import { checkIfEmailExists } from "../functions/auth";
import { generateOTP, verifyOTP } from "../services/redis";
import { create, syncUserData } from "../functions/user";

export const login = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { idToken } = req.body;
    try {

      const profile = await verifyUser(idToken);

      const checkEmail = await checkIfEmailExists(profile.email);

      if (!checkEmail.exists) {
        return sendResponse(res, {
          success: true,
          status: 200,
          data: {
            exists: false
          },
          message: 'User Not Found'
        })
      }
      let user = checkEmail.user[0];
      if (!user.name) {
        user.name = profile.name;
        user.picture = profile.photoUrl;
        const syncData = await syncUserData(user);

        let data = {
          name: syncData.data.name,
          email: syncData.data.email,
          picture: syncData.data.picture,
          mobile: syncData.data.mobile,
          role: syncData.data.role,
        }
        let response = generateJwtToken(data).data;
        return sendResponse(res, {
          success: true,
          status: 200,
          data: response,
          message: 'User Found'
        })

      }

      let response = generateJwtToken(checkEmail.user[0]).data;
      sendResponse(res, {
        success: true,
        status: 200,
        data: response,
        message: 'User Found'
      })

      // check in the database if the user email exists or not
      // if it does not exist, create a new user
    } catch (err) {
      next(err);
      // Handle the error here
    }
  }
);


export const sendOtp = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("here")
    const { phoneNumber } = req.body;
    try {
      const send = await generateOTP(phoneNumber);
      if (!send.success) {
        console.log(send.err);
        return sendResponse(res, { success: false, message: 'OTP Sending Failed', status: 400 })
      }

      console.log(send.data);
      sendResponse(res, { success: true, message: 'OTP Sent Successfully', status: 200 })
    } catch (err) {
      next(err);
    }
  }
)

export const verifyOtp = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, otp, accessToken } = req.body;
    try {
      const verify = await verifyOTP(phoneNumber, otp);
      console.log(verify);
      if (!verify) {
        return sendResponse(res, { success: false, message: 'OTP Verification Failed', status: 400 })
      }
      const user = await verifyUser(accessToken);
      const createUser = await create(user, phoneNumber);
      if (!createUser.success) {
        return sendResponse(res, { success: false, message: 'User Creation Failed', status: 400 })
      }
      if (!createUser.data) {
        return sendResponse(res, { success: false, message: 'User Creation Failed', status: 400 })
      }
      const payloadData = {
        name: createUser.data.name,
        email: createUser.data.email,
        picture: createUser.data.picture,
        mobile: createUser.data.mobile,
        role: createUser.data.role,
      }

      const response = generateJwtToken(payloadData).data;

      sendResponse(res, { success: true, message: 'OTP Verified Successfully', status: 200, data: response })
    }
    catch (err) {
      next(err);
    }
  }
)