import mongoose from 'mongoose';


/**
 * Establishes a connection to the MongoDB database using the provided connection URL.
 *
 * @function
 * @returns {Promise<string>} A Promise that resolves with a success message upon successful connection.
 * @throws {Error} If an error occurs during the connection process, the Promise is rejected with the error message.
 */
export const connect = (): Promise<string> => new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONOGODB_URL!)
        .then(() => resolve('=> Connected to Mongodb!'))
        .catch((err) => reject(err.message));
});