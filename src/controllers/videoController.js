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

export const see = (req, res) => {
  res.render('watch', { pageTitle: 'Watch' });
};

export const edit = (req, res) => {
  res.render('edit', { pageTitle: 'Edit Video' });
};

export const search = (req, res) => {
  res.send('Search');
};

export const upload = (req, res) => {
  res.send('Upload Video');
};

export const deleteVideo = (req, res) => {
  res.send('Delete Video');
};
