import jwt from "jsonwebtoken";
import {JwtPayload} from "@/types/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1d",
    });
}