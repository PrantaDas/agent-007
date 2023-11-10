import { Request } from 'express';
import mongoose, { ObjectId } from 'mongoose';

export interface Action {
    command: string;
    text?: string | undefined;
}

export interface UserData {
    name: string;
    department: string;
    title: string;
    userName?: string | undefined;
    userId: string;
}

export interface Token {
    id?: string
}

export interface User {
    name?: string;
    userName?: string | null | undefined;
    department?: string | null | undefined;
    title?: string | null | undefined;
    password?: string | null | undefined;
    role: "user" | "admin";
    __v?: string | undefined;
    _id: mongoose.Types.ObjectId;
    userId: string;
    createdAt?: NativeDate | undefined;
    updatedAt?: NativeDate | undefined;
}

export interface Req extends Request {
    user: User;
}

