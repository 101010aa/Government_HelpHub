import { User, Helpline, Category, Conversation } from "../models/index.js";
import { ok, fail, validId, safeUser } from "./shared.js";

export async function stats(req, res, next) {
  try {
    const [users, helplines, verified, active, categories, conversations] =
      await Promise.all([
        User.countDocuments(),
        Helpline.countDocuments(),
        Helpline.countDocuments({ isVerified: true }),
        Helpline.countDocuments({ isActive: true }),
        Category.countDocuments(),
        Conversation.countDocuments(),
      ]);
    ok(res, { users, helplines, verified, active, categories, conversations });
  } catch (e) {
    next(e);
  }
}
export async function users(req, res, next) {
  try {
    const q = String(req.query.search || "").trim();
    const filter = q
      ? {
          $or: [
            { name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
            {
              email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
            },
          ],
        }
      : {};
    ok(res, await User.find(filter).sort("-createdAt").select("-password"));
  } catch (e) {
    next(e);
  }
}
export async function userUpdate(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid user id.");
    const target = await User.findById(req.params.id);
    if (!target) throw fail(404, "User not found.");
    if (
      target.role === "admin" &&
      req.body.isActive === false &&
      (await User.countDocuments({ role: "admin", isActive: true })) <= 1
    )
      throw fail(409, "Cannot deactivate the last active administrator.");
    if (target._id.equals(req.user._id) && req.body.role === "user")
      throw fail(400, "You cannot remove your own administrator role.");
    if (["user", "admin"].includes(req.body.role)) target.role = req.body.role;
    if (typeof req.body.isActive === "boolean")
      target.isActive = req.body.isActive;
    await target.save();
    ok(res, safeUser(target));
  } catch (e) {
    next(e);
  }
}
