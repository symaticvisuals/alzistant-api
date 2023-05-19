import { Request } from "express";
export interface NameRequest extends Request {
    details: string;
    user: any;
}