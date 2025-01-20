import jwt from 'jsonwebtoken';

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: { user } });
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    domain: 'semah-frontend.vercel.app',
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
};

export { createJWT, isTokenValid, attachCookiesToResponse };
