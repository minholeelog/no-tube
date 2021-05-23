export const home = (req, res) => {
  res.send('Home');
};

export const search = (req, res) => {
  res.send('Search');
};

export const see = (req, res) => {
  res.send(`Watch Video #${req.params.id}`);
};

export const edit = (req, res) => {
  res.send('Edit Video');
};

export const upload = (req, res) => {
  res.send('Upload Video');
};

export const deleteVideo = (req, res) => {
  res.send('Delete Video');
};
