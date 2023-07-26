import dotenv from "dotenv"

  dotenv.config({
    path: process.env.NODE_ENV === "production" ? "./.env.production.local" : `./.env.${process.env.NODE_ENV || "development"}.local`,
  });
  
const appConfig = {
  API_VERSION: process.env.API_VERSION,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  ORIGIN: process.env.ORIGIN,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  SECRET_JWT: process.env.SECRET_JWT,
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME,
};

export { appConfig };