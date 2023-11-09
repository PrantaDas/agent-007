import { Schema, model } from "mongoose";

const schema = new Schema({
    name: {
        type: String,
        unique: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

const Image = model('Image', schema);
module.exports = Image;