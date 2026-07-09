import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { TUser, TLoginUser, TUpdateUser } from "./user.interface";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const createUserIntoDb = async (payload: TUser) => {
  const { email, name, password, role } = payload;

  const isUserExits = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExits) {
    throw new Error("User with the email already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role,
    },
    omit: {
      password: true,
    },
  });

  return createUser;
};

const loginUserFromDb = async (payload: TLoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("No user found with this email");
  }

  if (user.status === "BANNED") {
    throw new Error("This account has been banned");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Incorrect password");
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    tokenPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    tokenPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  const { password: _pw, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const getMeFromDb = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateMeIntoDb = async (userId: string, payload: TUpdateUser) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      phone: payload.phone,
      avatar: payload.avatar,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

export const userService = {
  createUserIntoDb,
  loginUserFromDb,
  getMeFromDb,
  updateMeIntoDb,
};
