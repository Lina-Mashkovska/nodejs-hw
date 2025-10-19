import createHttpError from "http-errors";
import { Note } from "../models/note.js";


export async function getAllNotes(req, res, next) {
  try {
    const { page = 1, perPage = 10, tag, search = "" } = req.query;

    const filter = {};
    if (tag) filter.tag = tag;
    if (search && search.trim() !== "") {
      filter.$text = { $search: search.trim() };
    }

    const pageNum = Number(page);
    const limit = Number(perPage);
    const skip = (pageNum - 1) * limit;

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      page: pageNum,
      perPage: limit,
      totalNotes,
      totalPages: Math.ceil(totalNotes / limit) || 1,
      notes,
    });
  } catch (e) {
    next(e);
  }
}

export async function getNoteById(req, res, next) {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json(note);
  } catch (e) {
    next(e);
  }
}


export async function createNote(req, res, next) {
  try {
    const { title, content, tag } = req.body;
    const note = await Note.create({ title, content, tag });
    res.status(201).json(note);
  } catch (e) {
    next(e);
  }
}

export async function updateNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json(note);
  } catch (e) {
    next(e);
  }
}


export async function deleteNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);
    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json(note);
  } catch (e) {
    next(e);
  }
}

