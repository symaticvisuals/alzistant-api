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
exports.createRelative = void 0;
const relative_1 = require("../schema/relative");
const createRelative = (name, relationship, email, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    const relative = new relative_1.Relative({ name, relationship, email, patientId });
    yield relative.save();
    // return relative as a object instead of a document
    return relative.toObject();
});
exports.createRelative = createRelative;
