import mongoose, { Schema, models } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  owner: Schema.Types.ObjectId;
  collaborators: Schema.Types.ObjectId[];
  sharedWith: {
    userId: Schema.Types.ObjectId
    role: 'editor' | 'viewer'
  }[]
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

    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Note = models.Note || mongoose.model("Note", noteSchema);
