import mongoose from "mongoose";
import { appConfig } from "../config/config.js";
const { NODE_ENV, PORT, DB_URL } = appConfig;
import dotenv from "dotenv";

const conexionBaseDatos = async () => {
    try {
    dotenv.config();
    await mongoose.connect(DB_URL);
    console.log("Base de datos MongoDB Atlas conectada");
        
    } catch (error) {
        console.log("Base de datos no conectada: " + error);
    }
  };
  


  export default conexionBaseDatos