import jwt from "jsonwebtoken";

const JWT_EXPIRE = process.env.JWT_EXPIRE || "3600";
const JWT_SECRET = process.env.JWT_SECRET || "secret_key_123456789abcdef";

const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "5184000"; // 60 days in seconds
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

export const generateAccessToken = (userId: string, roles: string[]) => {
  const payload = {
    sub: userId,
    roles: roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + Number(JWT_EXPIRE),
  };

  return jwt.sign(payload, JWT_SECRET as string);
};

export const generateRefreshToken = (userId: string) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + Number(JWT_REFRESH_EXPIRE),
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET as string);
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET as string);
  } catch (err) {
    return null;
  }
};
