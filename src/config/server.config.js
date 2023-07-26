import dotenv from "dotenv"
import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import passport from "passport";
import conexionBaseDatos from "../db/mongo.config.js";

import messagesModel from "../dao/models/messages.model.js";
import __dirname from "../utils.js";
import cookieParser from "cookie-parser";
import viewsRouter from "../routes/views.router.js";

import prodRouter from "../routes/products.js";
import cartRouter from "../routes/carts.js";
import uploadRouter from "../routes/uploadfiles.router.js";
import sessionRouter from "../routes/session.router.js";

 
class ServerConfig {
  constructor(app, httpServer) {
    this.app = app;
    this.httpServer = httpServer; 
  }

  configure() {
    this.onBaseDb();
    this.configureExpress();
    this.configureRoutes();
    this.iniciarWebsoket();
  }

  onBaseDb() {
    try {
      conexionBaseDatos();
    } catch (error) {
      console.log(`Base de datos no conectada: ${error}`);
    }
  }

  configureExpress() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(`${__dirname}/public`));
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
    

    this.app.engine("handlebars", handlebars.engine());
    this.app.set("views", `${__dirname}/views`);
    this.app.set("view engine", "handlebars");
  }

  configureRoutes() {
    console.log("Configuración de rutas correcta...");
    this.app.use("/", viewsRouter);
    this.app.set("products", `${__dirname}/api`);
    this.app.set("product engine", "handlebars");
    this.app.use("/api/products/", prodRouter);
    this.app.use("/api/carts/", cartRouter);
    this.app.use("/api/upload/", uploadRouter);
    this.app.use("/api/session/", sessionRouter);
  }

  iniciarWebsoket() {
    const io = new Server(this.httpServer);

    io.on("connection", (socketClient) => {
      console.log(`Cliente conectado por socket: ${socketClient.id}`);
      socketClient.on("message", (data) => {
        console.log(data);
      });
      socketClient.emit("evento_para_mi_usuario", "Actualización de datos");
      socketClient.broadcast.emit(
        "evento_para_todos_menos_el_actual",
        "Actualización de datos"
      );
      io.emit("evento_para_todos", "Actualización de datos global");
    });

    const messages = [];
    io.on("connection", (socket) => {
      console.log("Nuevo cliente conectado");

      socket.on("message", (dataM) => {
        messages.push(dataM);
        io.emit("messageLogs", messages);
        const message = new messagesModel(dataM);
        message
          .save()
          .then(() => {
            console.log("Mensaje guardado en la base de datos");
          })
          .catch((error) => {
            console.log(
              "Error al guardar el mensaje en la base de datos: " + error
            );
          });
      });

      socket.on("authenticated", (data) => {
        socket.emit("messageLogs", messages);
        socket.broadcast.emit("newUserConected", data);
      });
    });
  }
}




export default ServerConfig;