import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { getEnv } from "./env";

export interface AppTokenPayload extends JWTPayload {
  userId?: string;
  customerId?: string;
  email?: string;
  paid?: boolean;
  lifetime?: boolean;
}

function getSecretBytes() {
  return new TextEncoder().encode(getEnv("JWT_SECRET"));
}

export async function signAccessToken(payload: AppTokenPayload, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretBytes());
}

export async function verifyAccessToken(token: string) {
  return jwtVerify<AppTokenPayload>(token, getSecretBytes());
}

export function extractTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/rs_token=([^;]+)/);
  return tokenMatch?.[1] ?? null;
}
