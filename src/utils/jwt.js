import Jwt from "jsonwebtoken";
import passport from "passport";
import { appConfig } from "../config/config.js";

const { SECRET_JWT, JWT_COOKIE_NAME } = appConfig;

const generateJWT = (user) => {
    return new Promise((resolve, reject) => {
      //{ expiresIn: "1h" }
      Jwt.sign({ user }, SECRET_JWT, { expiresIn: "5m" }, (err, token) => {
        if (err) {
          console.log("🚀 ~ file: jwt.js:10 ~ jwt.sign ~ err:", err);
          reject("can not generate token, something wrong");
        }
        resolve(token);
      });
    });
  };
  

  const extractCookie = req => {
    return (req && req.cookies) ? req.cookies[JWT_COOKIE_NAME] : null
}

const passportCall = (strategy) => {
    return async (req, res, next) => {
      passport.authenticate(strategy, function (err, user, info) {
        if (err) return next(err);
  
        if (!user) {
          //return res.status(401).json({error: info.messages ? info.messages : info.toString(), message: `error in jwt`,});
          return res.render('user/timeExpToken', {err})
        }
        req.user = user;
        next();
      })(req, res, next);
    };
  };
   
  

  export { generateJWT, extractCookie, passportCall };

  