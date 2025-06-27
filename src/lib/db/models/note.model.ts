import mongoose, { Schema, models } from "mongoose";
import { Types } from "mongoose";


export interface ISharedWith {
  userId: Types.ObjectId;
  role: "editor" | "viewer";
}

export interface INote {
  _id: Types.ObjectId;
  title: string;
  content: string;
  owner: Types.ObjectId;
  collaborators: Types.ObjectId[];
  sharedWith: ISharedWith[];
  createdAt?: Date;
  updatedAt?: Date;
}


const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sharedWith: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["editor", "viewer"], required: true },
      },
    ],

  },
  { timestamps: true }
);

export const Note = models.Note || mongoose.model("Note", noteSchema);
