import { z } from "zod";

// Utility
export const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ID" });

const UserName = z
  .string()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(50, { message: "Name must be at most 50 characters" });
const Email = z.string().min(1, "Email is required").email("Email is invalid");
const Password = z.string().min(6, "Password must be at least 6 characters");

// ================== AUTH ==================

export const UserSignInSchema = z.object({
  email: Email,
  password: Password,
});

export const UserSignUpSchema = z.object({
  name: UserName,
  email: Email,
  password: Password,
});

export const NoteCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
})

export const NoteUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required"),
})

export const NoteShareSchema = z.object({
  recipientEmail: z.string().email("Invalid email"),
  role: z.enum(["editor", "viewer"]),
})














