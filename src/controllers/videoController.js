// Fake data
const videos = [
  {
    title: 'First Video',
    rating: 5,
    comments: 2,
    createdAt: '5 minutes ago',
    views: 44,
    id: 1,
  },
  {
    title: 'Second Video',
    rating: 4,
    comments: 1,
    createdAt: '5 minutes ago',
    views: 21,
    id: 2,
  },
  {
    title: 'Third Video',
    rating: 2,
    comments: 0,
    createdAt: '15 minutes ago',
    views: 12,
    id: 3,
  },
];

export const home = (req, res) => {
  res.render('home', { pageTitle: 'Home', videos });
};

export const watch = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render('watch', { pageTitle: `Watching: ${video.title}`, video });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render('edit', { pageTitle: `Editing: ${video.title}`, video });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: 'Upload Video' });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title,
    rating: 0,
    comments: 0,
    createdAt: 'Just now',
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect('/');
};
