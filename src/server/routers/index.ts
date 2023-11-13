import { Router } from "express";
import userRouter from "./user.route";
import imageRouter from "./image.route";

const router = Router();

const v1 = [
    userRouter, //user routes
    imageRouter  //image routes
];

router.use('/api/v1', v1); // version 1 routes

export default router;