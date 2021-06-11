export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = 'NoTube';
  res.locals.loggedInUser = req.session.user;
  next();
};
