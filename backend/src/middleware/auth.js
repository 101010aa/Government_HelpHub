import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
export async function protect(req, res, next) {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Please sign in to continue." });
    const p = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(p.id);
    if (!user || !user.isActive)
      return res
        .status(401)
        .json({ success: false, message: "Account unavailable." });
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session." });
  }
}

export async function optionalProtect(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) return next();
  return protect(req, res, next);
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin")
    return res
      .status(403)
      .json({ success: false, message: "Administrator access required." });
  next();
}
