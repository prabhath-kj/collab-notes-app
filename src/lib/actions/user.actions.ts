"use server";

import { connectToDatabase } from "../db";
import { UserSignUpSchema } from "../validator";
import { User } from "../db/models/user.model";
import bcrypt from "bcryptjs";
import { formatError } from "../utils";
import { IUserSignIn, IUserSignUp } from "../types";
import jwt from "jsonwebtoken";

// Register user server action
export async function registerUser(userData: IUserSignUp) {
  try {
    await connectToDatabase();
    const user = await UserSignUpSchema.parseAsync(userData);
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await User.create({ ...user, password: hashedPassword });
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export const loginUser = async (data: IUserSignIn) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid password" };
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return { success: true, token, user };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
