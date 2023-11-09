import { connect } from 'mongoose';

module.exports = () => new Promise((resolve, reject) => {
    connect(process.env.MONOGODB_URL!)
        .then(() => resolve('=> Connected to Mongodb!'))
        .catch((err) => reject(err.message));
});