import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { ok, fail, safeUser } from "./shared.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (
      !name?.trim() ||
      !/^\S+@\S+\.\S+$/.test(email || "") ||
      (password || "").length < 8
    )
      throw fail(
        400,
        "Enter a name, valid email, and password of at least 8 characters.",
      );
    const u = await User.create({ name, email, password });
    ok(
      res,
      {
        user: safeUser(u),
        token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        }),
      },
      "Account created",
      201,
    );
  } catch (e) {
    next(e);
  }
}
export async function login(req, res, next) {
  try {
    const u = await User.findOne({
      email: String(req.body.email || "").toLowerCase(),
    }).select("+password");
    if (!u || !u.isActive || !(await u.checkPassword(req.body.password || "")))
      throw fail(401, "Email or password is incorrect.");
    ok(
      res,
      {
        user: safeUser(u),
        token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        }),
      },
      "Signed in",
    );
  } catch (e) {
    next(e);
  }
}
export async function me(req, res) {
  ok(res, { user: safeUser(req.user) });
}
export async function updateMe(req, res, next) {
  try {
    if (req.body.name) req.user.name = String(req.body.name).trim();
    if (req.body.password) {
      if (req.body.password.length < 8)
        throw fail(400, "Password must be at least 8 characters.");
      req.user.password = req.body.password;
    }
    await req.user.save();
    ok(res, { user: safeUser(req.user) });
  } catch (e) {
    next(e);
  }
}
