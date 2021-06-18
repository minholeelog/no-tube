import User from '../models/User';
import bcrypt from 'bcrypt';

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
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    res.redirect('/login');
  } catch (error) {
    return res
      .status(400)
      .render('join', { pageTitle, errorMessage: error._message });
  }
};

export const getLogin = (req, res) => {
  res.render('login', { pageTitle: 'Login' });
};

export const postLogin = async (req, res) => {
  const pageTitle = 'Login';
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: 'Username does not exist.',
    });
  }

  const confirmUser = await bcrypt.compare(password, user.password);
  if (!confirmUser) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: 'Wrong password',
    });
  }

  // Initialize session
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect('/');
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
