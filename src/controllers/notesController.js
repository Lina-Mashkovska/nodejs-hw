import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;

    const pageNum = Number(page);
    const perPageNum = Number(perPage);
    const filter = { userId: req.user._id };

    if (tag) filter.tag = tag;

    if (typeof search === "string" && search.trim() !== "") {
      filter.$text = { $search: search.trim() };
    }

    const skip = (pageNum - 1) * perPageNum;
    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPageNum),
      Note.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPageNum));

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
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
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });

    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json({ note });
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {

    const note = await Note.create({ ...req.body, userId: req.user._id });

    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

   
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id }, 
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
  
    if (!note) throw createHttpError(404, "Note not found");
    res.status(200).json({ note });
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });
   

    if (!note) throw createHttpError(404, "Note not found");
    res.status(204).send();
   
  } catch (err) {
    next(err);
  }
};



