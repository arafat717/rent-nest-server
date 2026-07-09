import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export type TUser = {
  name: string;
  email: string;
  password: string;
  profilePhoto: string;
  role: "TENANT" | "LANDLORD";
};

export type TLoginUser = {
  email: string;
  password: string;
};

export type TUpdateUser = {
  name?: string;
  phone?: string;
  avatar?: string;
};
