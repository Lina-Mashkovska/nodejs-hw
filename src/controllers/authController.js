import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { createSession, setSessionCookies } from "../services/auth.js";

const SALT_ROUNDS = 10;

export async function registerUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw createHttpError(400, "Email in use");

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password: hash });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user); 
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw createHttpError(401, "Invalid credentials");

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function refreshUserSession(req, res, next) {
  try {
    const { sessionId, refreshToken } = req.cookies ?? {};

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) throw createHttpError(401, "Session not found");

    if (Date.now() > new Date(session.refreshTokenValidUntil).getTime()) {
      throw createHttpError(401, "Session token expired");
    }

    const userId = session.userId;
    await Session.deleteOne({ _id: session._id });

    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: "Session refreshed" });
  } catch (err) {
    next(err);
  }
}

export async function logoutUser(req, res, next) {
  try {
    const { sessionId } = req.cookies ?? {};
    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    const clear = { path: "/", httpOnly: true, secure: true, sameSite: "none" };
    res.clearCookie("accessToken", clear);
    res.clearCookie("refreshToken", clear);
    res.clearCookie("sessionId", clear);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

