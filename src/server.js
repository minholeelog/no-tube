import express from 'express';
import logger from 'morgan';
import session from 'express-session';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import { localsMiddleware } from './middlewares';

const app = express();

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'Hello!',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(localsMiddleware);

app.get('/add-one', (req, res) => {
  req.session.potato += 1;
  return res.send(`${req.session.id}\n${req.session.potato}`);
});
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
