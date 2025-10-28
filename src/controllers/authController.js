import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import fs from "fs";
import handlebars from "handlebars";

import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { createSession, setSessionCookies } from "../services/auth.js";
import { sendEmail } from "../utils/sendMail.js";

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

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    }

    const token = jwt.sign(
      { sub: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const template = fs.readFileSync("src/templates/reset-password-email.html", "utf-8");
    const compiled = handlebars.compile(template);
    const html = compiled({
      username: user.username,
      resetLink: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`,
    });

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      templatePath: "src/templates/reset-password-email.html",
      variables: {
        username: user.username,
        resetLink: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`,
      },
      html,
    });

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch {
    next(createHttpError(500, "Failed to send the email, please try again later."));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw createHttpError(401, "Invalid or expired token");
    }

    const user = await User.findOne({ _id: payload.sub, email: payload.email });
    if (!user) throw createHttpError(404, "User not found");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};



