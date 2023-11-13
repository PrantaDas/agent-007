import { Response } from "express";
import { Req } from "../../utils/types";
import Image from "../models/imgae.model";
import { unlinkSync } from "fs";
import path from "path";



/**
 * Retrieves and sends a specific image file by its name.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object containing the image name in the parameters.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the requested image file.
 *
 * @throws {Error} If an unexpected error occurs during the retrieval process.
 */
export const getOne = async (req: Req, res: Response): Promise<any> => {
    try {
        const { name } = req.params;
        const root = path.resolve();
        const image = await Image.findOne({ name });
        if (!image) return res.status(404).send({ message: 'Image not found' });
        return res.status(200).sendFile(root + 'screenshots' + image.name);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};



/**
 * Retrieves a list of images associated with the authenticated user.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object that may contain user information.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the list of images associated with the user.
 *
 * @throws {Error} If an unexpected error occurs during the retrieval process.
 */
export const getAll = async (req: Req, res: Response): Promise<any> => {
    try {
        const images = await Image.find({ user: req?.user?._id });
        return res.status(200).send(images);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};



/**
 * Deletes a specific image associated with the authenticated user based on the provided image ID.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object containing the image ID in the parameters.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} A Promise that resolves with the result of the delete operation.
 *
 * @throws {Error} If an unexpected error occurs during the delete process.
 */
export const reomveOne = async (req: Req, res: Response) => {
    try {
        const { id } = req.params;
        const image = await Image.findById({ _id: req?.user?._id });
        await Image.deleteOne({ _id: id });
        unlinkSync(path.join(process.cwd(), 'screenshots', image?.name!));
        return res.status(200).send({ message: 'Image deleted successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};