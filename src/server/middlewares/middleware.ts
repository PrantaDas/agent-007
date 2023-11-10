import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.models'
import { Req, Token } from '../../utils/types';



export const auth = async (req: Req, res: Response, next: NextFunction) => {
    try {
        const token = req?.cookies?.[process.env.COOKIE_KEY!];
        if (!token) return res.status(401).send({ message: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.HASING_KEY!) as Token;
        const user = await User.findOne({ _id: decoded.id });
        if (!user) return res.status(401).send({ message: 'Unauthorized' });
        req.user = user;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

export const checkRole = (roles: Array<string>) => {
    return async (req: Req, res: Response, next: NextFunction) => {
        try {
            if (roles.includes(req.user.role)) next();
            throw new Error('Unauthorized');
        }
        catch (err) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
    };
};

