"use server"

import { connectToDatabase } from "../db"
import { Note } from "../db/models/note.model"
import { User } from "../db/models/user.model"
import { formatError, getUserIdFromToken } from "../utils"
import { NoteCreateSchema,MongoId,NoteShareSchema,NoteUpdateSchema } from "../validator"


export const createNote = async (token: string, title: string) => {
  try {
    const parsed = NoteCreateSchema.parse({ title })

    await connectToDatabase()
    const userId = getUserIdFromToken(token)
    if (!userId) return { success: false, message: "Unauthorized" }

    const note = await Note.create({ title: parsed.title, owner: userId })
    return { success: true, note: JSON.parse(JSON.stringify(note)) }
  } catch (error) {
    console.error("CREATE_NOTE_ERROR", error)
    return { success: false, message: formatError(error) }
  }
}

export const getMyNotes = async (token: string) => {
  try {
    await connectToDatabase()
    const userId = getUserIdFromToken(token)
    if (!userId) return { success: false, message: "Unauthorized" }

    const notes = await Note.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).sort({ updatedAt: -1 })

    return { success: true, notes: JSON.parse(JSON.stringify(notes)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export const getNoteById = async (token: string, noteId: string) => {
  try {
    await connectToDatabase()
    const userId = getUserIdFromToken(token)
    if (!userId) {
      return { success: false, message: "Invalid or expired token" }
    }

    MongoId.parse(noteId)

    const note = await Note.findOne({
      _id: noteId,
      owner: userId,
    })

    if (!note) {
      return { success: false, message: "Note not found" }
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
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export const updateNote = async (
  token: string,
  noteId: string,
  data: { title: string; content: string }
) => {
  try {
    await connectToDatabase()
    const userId = getUserIdFromToken(token)
    if (!userId) {
      return { success: false, message: "Invalid or expired token" }
    }

    MongoId.parse(noteId)
    NoteUpdateSchema.parse(data)

    const note = await Note.findOneAndUpdate(
      { _id: noteId, owner: userId },
      {
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      },
      { new: true }
    )

    if (!note) {
      return { success: false, message: "Note not found or not yours" }
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
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export const shareNote = async (
  token: string,
  noteId: string,
  recipientEmail: string,
  role: "editor" | "viewer"
) => {
  try {
    await connectToDatabase()
    const userId = getUserIdFromToken(token)
    if (!userId) {
      return { success: false, message: "Invalid or expired token" }
    }

    MongoId.parse(noteId)
    NoteShareSchema.parse({ recipientEmail, role })

    const userToShareWith = await User.findOne({ email: recipientEmail })
    if (!userToShareWith) {
      return { success: false, message: "User not found" }
    }

    const note = await Note.findById(noteId)
    if (!note) {
      return { success: false, message: "Note not found" }
    }

    const alreadyShared = note.sharedWith.find(
      (entry: { userId: { toString: () => any } }) =>
        entry.userId.toString() === userToShareWith._id.toString()
    )
    if (alreadyShared) {
      return { success: false, message: "Already shared with this user" }
    }

    note.sharedWith.push({ userId: userToShareWith._id, role })
    await note.save()

    return { success: true, message: "Note shared successfully" }
  } catch (error) {
    console.error(error)
    return { success: false, message: formatError(error) }
  }
}

export const removeNote = async (token: string, noteId: string) => {
  try {
    await connectToDatabase();
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return { success: false, message: "Invalid or expired token" };
    }

    MongoId.parse(noteId);

    const note = await Note.findOneAndDelete({ _id: noteId, owner: userId });
    if (!note) {
      return { success: false, message: "Note not found or not yours" };
    }

    return { success: true, message: "Note deleted successfully" };
  } catch (error) {
    console.error("REMOVE_NOTE_ERROR", error);
    return { success: false, message: formatError(error) };
  }
};
