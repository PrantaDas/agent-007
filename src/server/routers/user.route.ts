import { Router } from "express";
import { deleteOne, getAll, getOne, getOwn, registerUser, signIn, signOut, updateOwn } from "../entities/user.entity";
import { auth, checkRole } from "../middlewares/middleware";

const router = Router();


/**
  * POST ` /user/register
  * @description This route is used to register a single user.
  * @response {Object} 200 - the registered user object.
*/
router.post('/user/register', registerUser);


/**
  * POST ` /user/signin
  * @description This route is used to signin a user.
  * @response {Object} 200 - the user Object.
*/
router.post('/user/signin', signIn);


/**
  * POST ` /user/signout
  * @description This route is used to signout a single user.
  * @response {Object} 200 - a sucessfull response.
*/
router.post('/user/signout', auth, signOut);


/**
  * GET ` /user/me
  * @description This route is used to return the currently loggedin user.
  * @response {Object} 200 - a sucessfull response with user object.
*/
router.get('/user/me', auth, getOwn);


/**
  * PATCH ` /user/me
  * @description This route is used to update a single user.
  * @response {Object} 200 - the updaed user object.
*/
router.patch('/user/me', auth, updateOwn);

/**
  * GET ` /user/:id
  * @description This route is used to get a single user.
  * @response {Object} 200 - a sucessfull response with the user object.
*/
router.get('/user/:id', auth, checkRole(['admin']), getOne);


/**
  * GET ` /user/getall
  * @description This route is used to get all user.
  * @response {Object} 200 - a sucessfull response.
*/
router.get('/user/getall', auth, checkRole(['admin']), getAll);


/**
  * DELETE ` /user/remove/:id
  * @description This route is used to delee a single user.
  * @response {Object} 200 - a sucessfull response.
*/
router.delete('/user/remove/:id', auth, checkRole(['admin']), deleteOne);

export default router;