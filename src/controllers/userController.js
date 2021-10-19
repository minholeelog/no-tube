import User from '../models/User';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import qs from 'qs';
import axios from 'axios';

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

  const user = await User.findOne({ username, socialOnly: false });
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

export const startGithubLogin = (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/authorize';
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  };
  const params = new URLSearchParams(config).toString();
  const targetUrl = `${baseUrl}?${params}`;
  return res.redirect(targetUrl);
};

export const finishGithubLogin = async (req, res) => {
  // Todo: axios 사용으로 대체
  const baseUrl = 'https://github.com/login/oauth/access_token';
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const targetUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = 'https://api.github.com';

    // Get User Data
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    // Get User emails
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect('/login');
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        name: userData.name,
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        password: '',
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    return res.redirect('/login');
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: 'http://localhost:4040/users/kakao/finish',
    response_type: 'code',
    scope: 'profile,account_email',
  };
  const params = new URLSearchParams(config).toString();
  const targetUrl = `${baseUrl}?${params}`;
  return res.redirect(targetUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/token';
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    client_secret: process.env.KAKAO_SECRET,
    redirect_uri: 'http://localhost:4040/users/kakao/finish',
  };
  let token;
  try {
    token = await axios({
      method: 'POST',
      url: baseUrl,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirectUri: config.redirect_uri,
        code: req.query.code,
      }),
    });
  } catch (err) {
    return res.json(err.data);
  }
  let userData;
  try {
    userData = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });
  } catch (err) {
    return res.json(err.data);
  }
  const {
    data: { kakao_account, id },
  } = userData;
  let user = await User.findOne({ email: userData.data.kakao_account.email });
  if (!user) {
    user = await User.create({
      name: kakao_account.profile.nickname,
      avatarUrl: kakao_account.profile.profile_image_url,
      username: id,
      email: kakao_account.email,
      password: '',
      socialOnly: true,
      location: '',
    });
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    return res.redirect('/login');
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

export const see = (req, res) => {
  res.send('See User');
};

export const getEdit = (req, res) => {
  return res.render('edit-profile', { pageTitle: 'Edit Profile' });
};

export const postEdit = async (req, res) => {
  const pageTitle = 'Edit Profile';
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email: newEmail, username: newUsername, location },
    file,
  } = req;

  const existedEmail = await User.findOne({ email: newEmail });
  const existedUsername = await User.findOne({ username: newUsername });
  if (existedEmail && existedEmail._id.toString() !== _id) {
    return res.status(400).render('edit-profile', {
      pageTitle,
      errorMessage: 'This email is taken by someone.',
    });
  }
  if (existedUsername && existedUsername._id.toString() !== _id) {
    return res.status(400).render('edit-profile', {
      pageTitle,
      errorMessage: 'This username is taken by someone.',
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        avatarUrl: file ? file.path : avatarUrl,
        name,
        email: newEmail,
        username: newUsername,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect('/users/edit');
  } catch (err) {
    console.log(err);
  }
};

export const getChangePassword = (req, res) => {
  const {
    session: {
      user: { socialOnly },
    },
  } = req;
  if (socialOnly === true) {
    return res.redirect('/');
  }
  return res.render('users/change-password', { pageTitle: 'Change Password' });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { currentPassword, newPassword, newPasswordConfirm },
  } = req;

  const user = await User.findById(_id);

  const confirmPassword = await bcrypt.compare(currentPassword, user.password);
  if (!confirmPassword) {
    const errorMessage = 'The current password is incorrect';
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
      errorMessage,
    });
  }

  if (newPassword !== newPasswordConfirm) {
    const errorMessage = 'The password does not match';
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
      errorMessage,
    });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect('/users/logout');
};
