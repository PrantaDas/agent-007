import { Schema, model } from "mongoose";
import autopopulate from 'mongoose-autopopulate';
import paginate from 'mongoose-autopopulate';
import bcrypt from 'bcrypt';

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
    password: {
        type: String,
        trim: true
    },
    department: {
        type: String,
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


schema.plugin(paginate);
schema.plugin(autopopulate);


schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

schema.pre('save', async function (this, next) {
    const user = this;
    if (user.isModified('password') && user.password) {
        const hashed = await bcrypt.hash(user.password!, 10);
        user.password = hashed;
    }
    next();
});

const User = model('User', schema);
export default User;