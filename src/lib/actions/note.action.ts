"use server"

import { connectToDatabase } from "../db"
import { INote, Note } from "../db/models/note.model"
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
    await connectToDatabase();
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const notes = await Note.find({
      $or: [
        { owner: userId },
        { 'sharedWith.userId': userId },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean<INote[]>();

    const formattedNotes = notes.map((note) => ({
      _id: note._id.toString(),
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      owner: note.owner?.toString(),
      sharedWith: note.sharedWith?.map((sw: { userId: { toString: () => any }; role: any }) => ({
        userId: sw.userId?.toString(),
        role: sw.role,
      })) || [],
    }));

    return { success: true, notes: JSON.parse(JSON.stringify(formattedNotes)) };
  } catch (error) {
    console.error("GET_MY_NOTES_ERROR", error);
    return { success: false, message: formatError(error) };
  }
};


export const getNoteById = async (token: string, noteId: string) => {
  await connectToDatabase();
  const userId = getUserIdFromToken(token);
  if (!userId) return { success: false, message: "Unauthorized" };

  const note = await Note.findById(noteId);
  if (!note) return { success: false, message: "Note not found" };

  let role: 'owner' | 'editor' | 'viewer' | null = null;
  if (note.owner.toString() === userId) role = 'owner';
  else {
    const shared = note.sharedWith.find(
      (s: { userId: { toString: () => string } }) => s.userId.toString() === userId
    );
    role = shared?.role || null;
  }

  if (!role) return { success: false, message: "Access denied" };

  return {
    success: true,
    note: JSON.parse(JSON.stringify({
      _id: note._id,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      role,
    })),
  };
};

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
