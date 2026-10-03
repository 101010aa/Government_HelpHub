import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController.js";
import * as directoryController from "../controllers/directoryController.js";
import * as adminController from "../controllers/adminController.js";
import * as conversationController from "../controllers/conversationController.js";
import { protect, optionalProtect, adminOnly } from "../middleware/auth.js";
const router = Router(),
  authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  messageLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });
const auth = (req, res, next) => protect(req, res, next);
router.post("/auth/register", authLimit, authController.register);
router.post("/auth/login", authLimit, authController.login);
router.get("/auth/me", auth, authController.me);
router.put("/auth/me", auth, authController.updateMe);
router.get("/categories", optionalProtect, directoryController.categories);
router.post("/categories", auth, adminOnly, directoryController.categoryCreate);
router.put("/categories/:id", auth, adminOnly, directoryController.categoryUpdate);
router.delete("/categories/:id", auth, adminOnly, directoryController.categoryDelete);
router.get("/helplines", optionalProtect, directoryController.helplines);
router.get("/helplines/:id", optionalProtect, directoryController.helplineGet);
router.post("/helplines", auth, adminOnly, directoryController.helplineCreate);
router.put("/helplines/:id", auth, adminOnly, directoryController.helplineUpdate);
router.delete("/helplines/:id", auth, adminOnly, directoryController.helplineDelete);
router.get("/admin/stats", auth, adminOnly, adminController.stats);
router.get("/admin/users", auth, adminOnly, adminController.users);
router.put("/admin/users/:id", auth, adminOnly, adminController.userUpdate);
router.get("/conversations", auth, conversationController.conversations);
router.post("/conversations", auth, conversationController.conversationCreate);
router.get("/conversations/:id", auth, conversationController.conversationGet);
router.delete("/conversations/:id", auth, conversationController.conversationDelete);
router.get("/conversations/:id/messages", auth, conversationController.messageList);
router.post("/conversations/:id/messages", auth, messageLimit, conversationController.messageCreate);
router.put("/messages/:id", auth, conversationController.messageUpdate);
router.delete("/messages/:id", auth, conversationController.messageDelete);
export default router;
