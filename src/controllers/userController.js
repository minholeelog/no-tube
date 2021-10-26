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
  const { name, userId, email, password, password2, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: 'Password confirmation does not match.',
    });
  }

  const exists = await User.exists({ $or: [{ userId }, { email }] });
  if (exists) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: 'This username/email is already taken.',
    });
  }
  try {
    await User.create({
      name,
      userId,
      email,
      password,
      location,
      avatarUrl: '',
    });
    req.flash('success', '정상적으로 회원 가입을 완료했습니다.');
    return res.redirect('/login');
  } catch (error) {
    console.log(error);
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
  const { userId, password } = req.body;

  const user = await User.findOne({ userId, socialOnly: false });
  if (!user) {
    req.flash('error', '존재하지 않는 아이디입니다.');
    return res.status(400).render('login', {
      pageTitle,
    });
  }

  const confirmUser = await bcrypt.compare(password, user.password);
  if (!confirmUser) {
    req.flash('error', '비빌번호가 일치하지 않습니다.');
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
        userId: userData.login,
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
      userId: id,
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

export const see = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate({
      path: 'videos',
      populate: {
        path: 'owner',
        model: 'User',
      },
    });
    return res.render('users/profile', {
      pageTitle: user.name,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).render('404', { pageTitle: 'User not found.' });
  }
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
    body: { name, email: newEmail, location },
    file,
  } = req;

  const existedEmail = await User.findOne({ email: newEmail });
  if (existedEmail && existedEmail._id.toString() !== _id) {
    req.flash('error', '이미 사용중인 이메일 주소입니다.');
    return res.status(400).render('edit-profile', {
      pageTitle,
    });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        avatarUrl: file ? file.location : avatarUrl,
        name,
        email: newEmail,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    req.flash('success', '유저 정보를 변경했습니다.');
    return res.redirect('/users/edit');
  } catch (err) {
    req.flash(
      'error',
      '알 수 없는 에러가 발생했습니다. 관리자에게 문의해주세요.'
    );
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
    req.flash('error', '소셜 로그인 유저는 비밀번호를 변경할 수 없습니다.');
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
    req.flash('error', '현재 비밀번호가 일치하지 않습니다.');
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
    });
  }

  if (newPassword !== newPasswordConfirm) {
    req.flash('error', '비밀번호가 일치하지 않습니다.');
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
    });
  }
  user.password = newPassword;
  await user.save();
  req.flash('info', '비밀번호가 변경되었습니다.');
  return res.redirect('/users/logout');
};
