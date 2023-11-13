import { Router } from "express";
import { auth } from "../middlewares/middleware";
import { getAll, getOne, reomveOne } from "../entities/image.entity";

const router = Router();

/**
  * GET ` /image/:name
  * @description This route is used to get a single image.
  * @response {Object} 200 - the image.
*/
router.get('/image/:name', auth, getOne);


/**
  * GET ` /image/getall
  * @description This route is used to get all the images of the logged in user.
  * @response {Object} 200 - the images.
*/
router.get('/image/getall', auth, getAll);


/**
  * DELETE ` /image/remove/:id
  * @description This route is used to delete a single image.
  * @response {Object} 200 - the image.
*/
router.delete('/image/remove/:id', auth, reomveOne);

export default router;