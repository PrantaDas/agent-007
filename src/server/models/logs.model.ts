import { Schema, model } from "mongoose";
import autopopulate from 'mongoose-autopopulate';
import paginate from 'mongoose-autopopulate';

const schema = new Schema({
    date: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    history: [{
        message: { type: String },
        messageId: { type: String },
        _id: false
    },]
}, { timestamps: true });

schema.plugin(paginate);
schema.plugin(autopopulate);

schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

const Log = model('Log', schema);
module.exports = Log;