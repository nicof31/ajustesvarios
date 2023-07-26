import Jwt  from "jsonwebtoken";
import { appConfig } from "../config/config.js";

const { SECRET_JWT, JWT_COOKIE_NAME } = appConfig;

const authToken = (req, res, next) => {
  const token = req.cookies[JWT_COOKIE_NAME];
  if (!token) {
    return res.redirect('/login');
  }
  Jwt.verify(token, SECRET_JWT, (err, decodedToken) => {
    if (err) {
      // verfico si el toquen es valido o cuduco en el tiempo
      res.clearCookie(JWT_COOKIE_NAME);
     // return res.redirect('/login');
     return res.render('user/timeExpToken', {err});
    }
    // El token es válido
    req.user = decodedToken.user;
    next();
  });
};
export default authToken

