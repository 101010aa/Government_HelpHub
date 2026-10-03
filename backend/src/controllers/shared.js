import mongoose from "mongoose";

export const ok = (res, data, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });
export const fail = (status, message) =>
  Object.assign(new Error(message), { status });
export const validId = (id) => mongoose.isValidObjectId(id);
export const safeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  createdAt: u.createdAt,
});
