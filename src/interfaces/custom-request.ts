import { Request } from "express";
export interface NameRequest extends Request {
    name: string;
}