import User from '../models/User';

export const getJoin = (req, res) => {
  res.render('join', { pageTitle: 'Join' });
};

export const postJoin = async (req, res) => {
  const pageTitle = 'Join';
  const { name, username, email, password, password2, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: 'Password confirmation does not match.',
    });
  }

  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    res.status(400).render('join', {
      pageTitle,
      errorMessage: 'This username/email is already taken.',
    });
  }
  await User.create({
    name,
    username,
    email,
    password,
    location,
  });
  res.redirect('/login');
};

export const login = (req, res) => {
  res.send('Login');
};

export const logout = (req, res) => {
  res.send('Logout');
};

export const see = (req, res) => {
  res.send('See User');
};

export const edit = (req, res) => {
  res.send('Edit User');
};

export const remove = (req, res) => {
  res.send('Remove User');
};
