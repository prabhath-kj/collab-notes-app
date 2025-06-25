"use server";

import { connectToDatabase } from "../db";
import { Note } from "../db/models/note.model";
import { formatError, getUserIdFromToken } from "../utils";

export const createNote = async (token: string, title: string) => {
  try {
    await connectToDatabase();
    const userId = getUserIdFromToken(token);
    if (!userId) return { success: false, message: "Unauthorized" };

    const note = await Note.create({ title, owner: userId });
    return { success: true, note: JSON.parse(JSON.stringify(note)) };
  } catch (error) {
    console.error("CREATE_NOTE_ERROR", error);
    return { success: false, message: formatError(error) };
  }
};

export const getMyNotes = async (token: string) => {
  try {
    await connectToDatabase();
    const userId = getUserIdFromToken(token);
    if (!userId) return { success: false, message: "Unauthorized" };

    const notes = await Note.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).sort({ updatedAt: -1 });
    return { success: true, notes: JSON.parse(JSON.stringify(notes)) };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const getNoteById = async (token: string, noteId: string) => {
  try {
    await connectToDatabase();
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return { success: false, message: "Invalid or expired token" };
    }

    const note = await Note.findOne({
      _id: noteId,
      owner: userId,
    });

    if (!note) {
      return { success: false, message: "Note not found" };
    }

    return {
      success: true,
      note: JSON.parse(
        JSON.stringify({
          _id: note._id.toString(),
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
        })
      ),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const updateNote = async (
  token: string,
  noteId: string,
  data: { title: string; content: string }
) => {
  try {
    await connectToDatabase();
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return { success: false, message: "Invalid or expired token" };
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, owner: userId },
      {
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return { success: false, message: "Note not found or not yours" };
    }

    return {
      success: true,
      note: JSON.parse(
        JSON.stringify({
          _id: note._id.toString(),
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
        })
      ),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
