
import multer from "multer";
import __dirname from "../utils.js";


//Ruta a almacenar mis archivos
const storage = multer.diskStorage({
    //Carpeta
    destination:function(req,image,cb){
        cb(null,`${__dirname}/public/imgupload`)
            },
    filename: function(req,image,cb){
        cb(null,`${Date.now()}-${image.originalname}`);
    }
});

const uploader = multer({storage});

export default uploader;

