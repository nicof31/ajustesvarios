
import express from "express";
import { Server } from "socket.io";
import { appConfig } from "./config/config.js";
import ServerConfig from "./config/server.config.js";
import initializePassport from './config/passport.config.js'


const app = express();
const serverConfig = new ServerConfig(app);
const { NODE_ENV, PORT } = appConfig;

const env = NODE_ENV || "development";
const PUERTO = PORT || 8080;
const httpServer = app.listen(PUERTO, () => {
  try {
    console.log(`El servidor está escuchando en el puerto ${PUERTO}...`);
    initializePassport();
  } catch (error) {
    console.log(`Servidor no conectado: ${error}`);
  }
});
const io = new Server(httpServer);

//iniciar aplicación
const start= async () => {
  try{
    serverConfig.configure();
  }
    catch(error){
    console.error(`Error al iniciar la aplicación: ${error}`);
    };
    }

export { app, io , start };
