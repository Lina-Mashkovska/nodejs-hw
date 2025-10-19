import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;

    const filter = {};
    if (tag) filter.tag = tag;

    if (typeof search === "string" && search.trim() !== "") {
      filter.$text = { $search: search.trim() };
    }

    const skip = (page - 1) * perPage;

    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      Note.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPage));

    res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};


export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json({ note });
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
};


export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json({ note });
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);
    if (!note) throw createHttpError(404, "Note not found");
    res.status(204).send(); // без тіла
  } catch (err) {
    next(err);
  }
};


