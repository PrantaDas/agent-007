import { NextFunction, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Req, Token } from '../../utils/types';
import User from '../models/user.models';


/**
 * Middleware for authenticating users based on JWT tokens stored in cookies.
 *
 * @async
 * @function
 * @param {Req} req - Custom request object that may contain a user object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function to pass control to the next middleware.
 * @returns {Promise<any>} A Promise that resolves when authentication is successful or rejects on failure.
 *
 * @throws {Error} If an unexpected error occurs during the authentication process.
 */
export const auth: RequestHandler = async (req: Req, res: Response, next: NextFunction): Promise<any> => {
    try {
        const token = req?.cookies?.[process.env.COOKIE_KEY!];
        if (!token) return res.status(401).send({ message: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.HASING_KEY!) as Token;
        const user = await User.findOne({ _id: decoded.id });
        if (!user) return res.status(401).send({ message: 'Unauthorized' });
        if (user && user?._id) {
            req.user = user;
            next();
        }
        else return res.status(401).send({ message: 'Unauthorized' });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};


/**
 * Middleware for checking if the authenticated user has the required roles.
 *
 * @function
 * @param {string[]} roles - An array of role names that are allowed to access the resource.
 * @returns {(req: Req, res: Response, next: NextFunction) => Promise<void>} Middleware function.
 *
 * @throws {Error} If an unexpected error occurs during the role-checking process.
 */
export const checkRole = (roles: string[]): (req: Req, res: Response, next: NextFunction) => Promise<any> => {
    return async (req: Req, res: Response, next: NextFunction) => {
        try {
            if (roles.includes(req?.user?.role!)) next();
            throw new Error('Unauthorized');
        }
        catch (err) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
    };
};

