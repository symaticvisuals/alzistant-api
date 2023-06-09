import express, { Express, Request, Response } from 'express';
// import dotenv in this typescript express server
import dotenv from 'dotenv';
import cors from 'cors'
import { errorHandler } from './utils/utils';
import routes from './routes';
import { connectDbMiddleware } from './db/connection';


dotenv.config();
const app: Express = express();
const port = process.env.PORT

app.use(cors())

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(connectDbMiddleware());



routes.forEach((route) => {
    app.use(route.prefix, route.app);
});

app.get('/heartbeat', (req, res) => {
    res.send("404")
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`[Server]: I am running at https://localhost:${port}`);
});