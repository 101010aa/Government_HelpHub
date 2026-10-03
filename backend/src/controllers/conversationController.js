import { Conversation, Message, User } from "../models/index.js";
import { ok, fail, validId } from "./shared.js";

export async function conversations(req, res, next) {
  try {
    if (req.user.role === "admin")
      return ok(
        res,
        await Conversation.find()
          .populate("participants", "name email")
          .sort("-lastMessageAt"),
      );
    ok(
      res,
      await Conversation.find({ participants: req.user._id })
        .populate("participants", "name email")
        .sort("-lastMessageAt"),
    );
  } catch (e) {
    next(e);
  }
}
export async function conversationCreate(req, res, next) {
  try {
    const targetId = String(req.body.participantId || "").trim();
    if (!validId(targetId))
      throw fail(400, "Choose a valid user to start a conversation.");
    const target = await User.findById(targetId);
    if (!target || !target.isActive) throw fail(404, "User not found.");
    if (target._id.equals(req.user._id))
      throw fail(400, "Choose someone else to message.");
    let c = await Conversation.findOne({
      participants: { $all: [req.user._id, target._id], $size: 2 },
    });
    if (!c)
      c = await Conversation.create({
        participants: [req.user._id, target._id],
      });
    ok(
      res,
      await c.populate("participants", "name email"),
      "Conversation ready",
      201,
    );
  } catch (e) {
    next(e);
  }
}
async function getConversation(req) {
  if (!validId(req.params.id)) throw fail(400, "Invalid conversation id.");
  const c = await Conversation.findById(req.params.id).populate(
    "participants",
    "name email",
  );
  if (!c) throw fail(404, "Conversation not found.");
  if (
    req.user.role !== "admin" &&
    !c.participants.some((p) => p._id.equals(req.user._id))
  )
    throw fail(403, "You are not a participant.");
  return c;
}
export async function conversationGet(req, res, next) {
  try {
    ok(res, await getConversation(req));
  } catch (e) {
    next(e);
  }
}
export async function conversationDelete(req, res, next) {
  try {
    await getConversation(req);
    await Message.deleteMany({ conversation: req.params.id });
    await Conversation.findByIdAndDelete(req.params.id);
    ok(res, null, "Conversation deleted");
  } catch (e) {
    next(e);
  }
}
export async function messageList(req, res, next) {
  try {
    await getConversation(req);
    const filter = { conversation: req.params.id };
    if (req.query.after) {
      if (!validId(req.query.after)) throw fail(400, "Invalid message cursor.");
      const m = await Message.findById(req.query.after);
      if (m && !m.conversation.equals(req.params.id))
        throw fail(400, "The message cursor belongs to another conversation.");
      if (m)
        filter.$or = [
          { createdAt: { $gt: m.createdAt } },
          { createdAt: m.createdAt, _id: { $gt: m._id } },
        ];
    }
    const items = await Message.find(filter)
      .populate("sender", "name role")
      .sort({ createdAt: 1, _id: 1 })
      .limit(200);
    ok(res, items);
  } catch (e) {
    next(e);
  }
}
export async function messageCreate(req, res, next) {
  try {
    const c = await getConversation(req);
    const message = String(req.body.message || "").trim();
    if (!message || message.length > 4000)
      throw fail(400, "Message must contain 1 to 4,000 characters.");
    const m = await Message.create({
      conversation: c._id,
      sender: req.user._id,
      message,
    });
    c.lastMessage = message.slice(0, 180);
    c.lastMessageAt = m.createdAt;
    await c.save();
    ok(res, await m.populate("sender", "name role"), "Message sent", 201);
  } catch (e) {
    next(e);
  }
}
export async function messageUpdate(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid message id.");
    const m = await Message.findById(req.params.id);
    if (!m) throw fail(404, "Message not found.");
    if (req.user.role !== "admin" && !m.sender.equals(req.user._id))
      throw fail(403, "You can only edit your own messages.");
    const message = String(req.body.message || "").trim();
    if (!message || message.length > 4000)
      throw fail(400, "Message must contain 1 to 4,000 characters.");
    m.message = message;
    m.isEdited = true;
    await m.save();
    const c = await Conversation.findById(m.conversation);
    if (c?.lastMessage) c.lastMessage = message.slice(0, 180);
    await c?.save();
    ok(res, await m.populate("sender", "name role"));
  } catch (e) {
    next(e);
  }
}
export async function messageDelete(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid message id.");
    const m = await Message.findById(req.params.id);
    if (!m) throw fail(404, "Message not found.");
    if (req.user.role !== "admin" && !m.sender.equals(req.user._id))
      throw fail(403, "You can only delete your own messages.");
    await m.deleteOne();
    const last = await Message.findOne({ conversation: m.conversation }).sort(
      "-createdAt",
    );
    await Conversation.findByIdAndUpdate(m.conversation, {
      lastMessage: last?.message.slice(0, 180) || "",
      lastMessageAt: last?.createdAt || new Date(),
    });
    ok(res, null, "Message deleted");
  } catch (e) {
    next(e);
  }
}
