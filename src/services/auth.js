import { randomBytes } from "node:crypto";
import { Session } from "../models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/time.js";

const TOKEN_BYTES = 32;
const gen = () => randomBytes(TOKEN_BYTES).toString("hex");

export async function createSession(userId) {
  const now = Date.now();

  const session = await Session.create({
    userId,
    accessToken: gen(),
    refreshToken: gen(),
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + ONE_DAY),
  });

  return session;
}

export function setSessionCookies(res, session) {
  const base = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res.cookie("accessToken", session.accessToken, {
    ...base,
    maxAge: FIFTEEN_MINUTES,
  });
  res.cookie("refreshToken", session.refreshToken, {
    ...base,
    maxAge: ONE_DAY,
  });
  res.cookie("sessionId", String(session._id), {
    ...base,
    maxAge: ONE_DAY,
  });
}
