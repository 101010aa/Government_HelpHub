import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const opts = { timestamps: true };
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
  },
  opts,
);
userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.checkPassword = function (p) {
  return bcrypt.compare(p, this.password);
};
export const User = mongoose.model("User", userSchema);
export const Category = mongoose.model(
  "Category",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true, unique: true },
      description: { type: String, default: "" },
      icon: { type: String, default: "◈" },
      isActive: { type: Boolean, default: true },
    },
    opts,
  ),
);
export const Helpline = mongoose.model(
  "Helpline",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      number: { type: String, required: true, trim: true },
      description: { type: String, default: "" },
      purpose: { type: String, required: true },
      operator: { type: String, required: true },
      governmentBody: { type: String, default: "" },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      availability: { type: String, default: "Not specified" },
      isTollFree: { type: Boolean, default: false },
      eligibility: { type: String, default: "" },
      services: [String],
      contactChannels: [
        {
          channel: { type: String, required: true, trim: true },
          value: { type: String, required: true, trim: true },
          url: { type: String, default: "", trim: true },
        },
      ],
      additionalSources: [
        {
          label: { type: String, required: true, trim: true },
          url: { type: String, required: true, trim: true },
        },
      ],
      officialWebsite: { type: String, default: "" },
      sourceUrl: { type: String, default: "" },
      lastVerifiedAt: { type: Date, default: null },
      isVerified: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    },
    opts,
  ),
);
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  opts,
);
export const Conversation = mongoose.model("Conversation", conversationSchema);
export const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
    {
      conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: { type: String, required: true, trim: true, maxlength: 4000 },
      isEdited: { type: Boolean, default: false },
    },
    opts,
  ),
);
