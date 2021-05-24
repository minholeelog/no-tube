import mongoose from 'mongoose';

// 스키마: DB의 형태와 데이터 타입 정의

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: Date,
  hashtags: [{ type: String }],
  meta: {
    views: Number,
    rating: Number,
  },
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
