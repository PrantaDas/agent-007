import bcrypt from "bcrypt";
import { Request, RequestHandler, Response } from "express";
import { unlinkSync } from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { Req, UserPayload } from "../../utils/types";
import Image from "../models/imgae.model";
import User from "../models/user.models";

// allowed fileds for createing a user
const CREATE_ALLOWED = new Set(['name', 'password', 'userId', 'userName', 'department', 'title', 'role']);

// allowed fields for updating a user
const UPDATE_ALLOWED = new Set(['name', 'password', 'userName', 'department', 'title']);



/**
 * Handles the registration of a new user.
 *
 * @async
 * @function
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the result of the registration.
 *
 * @throws {Error} If an unexpected error occurs during the registration process.
 */
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, password } = req.body as UserPayload;
        if (!name || !password) return res.status(400).send({ message: 'Name and password must be provided' });
        const isValid = Object.keys(req.body).every((key) => CREATE_ALLOWED.has(key));
        if (!isValid) return res.status(400).send({ message: 'Bad Request' });
        const encryptedPass = bcrypt.hash(password, 10);
        req.body.password = encryptedPass;
        const user = new User(req.body);
        await user.save();
        return res.status(201).send(user);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Something went wrong' });
    }
};



/**
 * Handles user authentication and generates a JWT token upon successful sign-in.
 *
 * @async
 * @function
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the result of the sign-in.
 *
 * @throws {Error} If an unexpected error occurs during the sign-in process.
 */
export const signIn = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, password } = req.body as UserPayload;
        if (!name || !password) return res.status(400).send({ message: 'Name or password is required' });
        const user = await User.findOne({ name });
        if (!user) return res.status(404).send({ message: 'User doesn\'t exist.' });
        const isValidPassword = await bcrypt.compare(password, user.password!);
        if (!isValidPassword) return res.status(400).send({ message: 'Invalid password' });
        const token = jwt.sign({ id: user._id }, process.env.HASING_KEY!);
        res.cookie(process.env.COOKIE_KEY!, token, {
            sameSite: 'strict',
            secure: true,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
        });
        return res.status(200).send(user);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Something went wrong' });
    }
};


/**
 * Handles user sign-out by clearing the authentication cookie.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object that may contain user information.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response<any, Record<string, any>>>} A Promise that resolves with the result of the sign-out.
 *
 * @throws {Error} If an unexpected error occurs during the sign-out process.
 */
export const signOut = async (req: Req, res: Response): Promise<Response<any, Record<string, any>>> => {
    try {
        if (!req.user) return res.status(404).send({ message: 'User does not exist' });
        res.clearCookie(process.env.COOKIE_KEY!, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            expires: new Date(Date.now())
        });
        return res.status(200).send({ message: 'Logout successful' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};



/**
 * Retrieves information about the authenticated user.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object that may contain user information.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response<any, Record<string, any>>>} A Promise that resolves with the authenticated user's information.
 *
 * @throws {Error} If an unexpected error occurs during the retrieval process.
 */
export const getOwn = async (req: Req, res: Response): Promise<Response<any, Record<string, any>>> => {
    try {
        return res.status(200).send(req.user);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};



/**
 * Updates the information of the authenticated user.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object that may contain user information and updated data.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response<any, Record<string, any>>>} A Promise that resolves with the result of the update operation.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 */
export const updateOwn = async (req: Req, res: Response): Promise<Response<any, Record<string, any>>> => {
    try {
        const isValid = Object.keys(req.body as UserPayload).every((key) => UPDATE_ALLOWED.has(key));
        if (!isValid) return res.status(400).send({ message: 'Bad Request' });
        const user = await User.findOne({ _id: req?.user?._id! });
        if (!user) return res.status(404).send({ message: 'User does not exist' });
        const updatedUser = await User.updateOne({ _id: user._id }, { ...req.body });
        return res.status(200).send(updatedUser);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};

export const getOne = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).send({ message: 'User id is required' });
        const user = await User.findOne({ _id: id });
        if (!user) return res.status(404).send({ message: 'User not found' });
        return res.status(200).send(user);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};

/**
 * Retrieves a list of users based on the provided query parameters.
 *
 * @async
 * @function
 * @param {Request} req - Express request object containing query parameters for filtering users.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the list of users matching the query parameters.
 *
 * @throws {Error} If an unexpected error occurs during the retrieval process.
 */
export const getAll: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.find({ ...req.query });
        return res.status(200).send(users);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};


/**
 * Deletes a user and associated images based on the provided user ID.
 *
 * @async
 * @function
 * @param {Request} req - Express request object containing the user ID in the parameters.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the result of the delete operation.
 *
 * @throws {Error} If an unexpected error occurs during the delete process.
 */
export const deleteOne = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).send({ message: 'User Id is required' });
        const user = await User.findOne({ _id: id });
        if (!user) return res.status(404).send({ message: 'User does not exist' });
        const images = await Image.find({ user: user._id });
        if (images) {
            images.forEach((image) => unlinkSync(path.join(process.cwd(), process.env.FILE_DIR!, image.name!)));
            await Image.deleteMany({ user: user._id });
        }
        await User.deleteOne({ _id: user._id });
        return res.status(200).send({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};