import { Request, Response, NextFunction } from "express";
import { asyncMiddleware, generateJwtToken, sendResponse } from "../utils/utils";
import { verifyUser } from "../services/gAuth";
import { checkIfEmailExists } from "../functions/auth";
import { generateOTP } from "../services/redis";

export const login = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { idToken } = req.body;
    try {

      const profile = await verifyUser(idToken);

      const checkEmail = await checkIfEmailExists(profile.email);

      if (!checkEmail.exists) {
        sendResponse(res, {
          success: true,
          status: 200,
          data: {
            exists: false
          },
          message: 'User Not Found'
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
    const { phoneNumber } = req.body;
    try {
      const send = await generateOTP(phoneNumber);
      console.log(send);
      sendResponse(res, { success: true, message: 'OTP Sent Successfully', status: 200 })
    } catch (err) {
      next(err);
    }
  }
)