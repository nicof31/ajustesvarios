import { Router } from "express";
import uploader  from "../services/uploader.js";


const routerUploader = Router();

routerUploader.post('/',uploader.single("image"), (req, res) => {
    const imgUpload = req.body;
    if (!imgUpload ) {
        return res.status(404).send({status:"error",message: "cargue el archivo"});
      }
    //console.log(req.body)
    //uploader.push(imgUpload);
    return res.send({status: "sucess", mensage: "IMG upload"});
});



export default routerUploader;