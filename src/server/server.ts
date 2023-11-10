import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connect } from './db/connect';

const PORT = process.env.PORT!;
const app = express();

app.use(cookieparser());
app.use(cors())
app.use(express.json());
app.use(morgan('combined'));
app.use(helmet.contentSecurityPolicy({ useDefaults: true }));

app.listen(PORT, () => {
    connect()
        .then((res) => {
            console.log(res);
            console.log(`=> Server is listening on ${PORT}`);
        })
        .catch((err) => console.log(err));
});