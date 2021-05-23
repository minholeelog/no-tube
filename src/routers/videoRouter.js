import express from 'express';
import {
  deleteVideo,
  watch,
  upload,
  getEdit,
  postEdit,
} from '../controllers/videoController';

const videoRouter = express.Router();

videoRouter.get('/:id(\\d+)', watch);
// 동일한 URL에 get, post method를 사용할 경우..
videoRouter.route('/:id(\\d+)/edit').get(getEdit).post(postEdit);

export default videoRouter;
