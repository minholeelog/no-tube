import express from 'express';
import logger from 'morgan';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
