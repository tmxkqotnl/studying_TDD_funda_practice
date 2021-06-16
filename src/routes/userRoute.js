import userController from "../controllers/userController";
import { Router } from "express";
const router = Router();

router.post("/", userController.userCreate);
router.get("/", userController.getUsers);
router.get("/:userId", userController.getUserById);
router.put("/:userId", userController.userUpdate);
router.delete("/:userId", userController.userDelete);

export default router;
