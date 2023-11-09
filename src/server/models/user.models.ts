import { Schema, model } from "mongoose";

const schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        description: 'Name is required'
    },
    userName: {
        type: String,
        trim: true,
        unique: true
    },
    department: {
        tyep: String,
        trim: true
    },
    title: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: true
    }
}, { timestamps: true });


schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

const User = model('User', schema);
module.exports = User;