import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import logger from 'morgan';
import flash from 'express-flash';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import apiRouter from './routers/apiRouter';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import { localsMiddleware } from './middlewares';

const app = express();

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    // Only save cookie when session information were updated.
    saveUninitialized: false,
    // Set cookie expiration time
    cookie: {
      maxAge: 604800000,
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(flash());
app.use(localsMiddleware);
app.use('/static', express.static('assets'));
app.use('/statics', express.static('statics'));
app.use('/uploads', express.static('uploads'));
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);
app.use('/api', apiRouter);

export default app;
