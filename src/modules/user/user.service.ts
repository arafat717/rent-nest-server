
import bycript from "bcrypt";
import { TUser } from "./user.interface";
import { prisma } from "../../lib/prisma";

const createUserIntoDb = async (payload: TUser) => {
  const { email, name, password, profilePhoto } = payload;

  const isUserExits = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExits) {
    throw new Error("User with the email already exists");
  }

  const hashPassword = await bycript.hash(password, 10);

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
  });

  await prisma.profile.create({
    data: {
      userId: createUser.id,
      profilePhoto,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createUser.id,
      email: createUser.email || email,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return user;
};

export const userService = {
  createUserIntoDb,
};
