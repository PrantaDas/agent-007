import mongoose from 'mongoose';

export const connect = () => new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONOGODB_URL!)
        .then(() => resolve('=> Connected to Mongodb!'))
        .catch((err) => reject(err.message));
});