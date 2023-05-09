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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfEmailExists = void 0;
const user_1 = require("../schema/user");
const checkIfEmailExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.User.find({ email: email }).lean()
        .exec();
    if (user.length !== 0) {
        return {
            exists: true,
            user: user,
        };
    }
    return {
        exists: false,
        user: null,
    };
});
exports.checkIfEmailExists = checkIfEmailExists;
