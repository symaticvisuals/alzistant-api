import express, { Express, Request, Response } from 'express';
// import dotenv in this typescript express server
import dotenv from 'dotenv';
import cors from 'cors'
import { errorHandler } from './utils/utils';
import routes from './routes';
import { connectDbMiddleware } from './db/connection';
import { cronJob } from './services/cron';


dotenv.config();
const app: Express = express();
const port = process.env.PORT

app.use(cors())

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(connectDbMiddleware());

// add cron job here


routes.forEach((route) => {
    app.use(route.prefix, route.app);
});

app.get('/heartbeat', (req, res) => {
    res.send("404")
});


app.use(errorHandler);

app.listen(port, () => {
    cronJob();
    console.log(`[Server]: I am running at https://localhost:${port}`);
});