import productManager from "../dao/managers/productManager.js";
import productManagerMongo from "../dao/managers/productManager.mongodb.js";
import productsModel from "../dao/models/products.model.js";
import { Router } from "express";
import { appConfig } from "../config/config.js";
import authToken from "../middleware/usersessiontoken.js";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import UserModel from "../dao/models/users.model.js";

const { NODE_ENV, PORT, DB_URL, SECRET_JWT, JWT_COOKIE_NAME } = appConfig;
const productList = new productManager("src/files/products.json");
const routerView = Router();



   //-----------------------CHAT Handlebars---------------------------------//
   //http://localhost:8080/chat
   routerView.get("/chat", async (req, res) => {
    const chat = "prueba chat web soket"
       return res.render('chat',{
        chat});
   });
  

//-------------------------LOGIN USER------------------------------------------//

routerView.get("/",  async (req, res) => {
  try {
    res.render("user/login", {
      title: "Login",
      style: "home",
      logued: false,
    });
  } catch (error) {
    console.error("Error al renderizar la página de inicio:", error);
    return res.render("user/loginerror", { error: "Ocurrió un error al renderizar la página de inicio" });
  }
});

routerView.get("/login",  async (req, res) => {
  try {
    res.render("user/login", {
      title: "Login",
      style: "home",
      logued: false,
    });
  } catch (error) {
    console.error("Error al renderizar la página de login:", error);
    return res.render("user/loginerror", { error: "Ocurrió un error al renderizar la página de login" });
  }
});



  //-------------------------LOG OUT------------------------------------------//
  
  routerView.get('/logout', (req, res) => {
    try {
      res.clearCookie(JWT_COOKIE_NAME);
      res.redirect('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      res.status(500).send({ error: "Ocurrió un error al cerrar sesión" });
    }
  });

   //---------------------PRODUCTS LOGIN-------------------------------//
 
 //http://localhost:8080/products

  routerView.get("/products", [authToken,  passportCall("jwt"), handlePolicies(["ADMIN", "USER", "PUBLIC"])], async (req, res) => {
  try {

   // Utilizo los datos del usuario autenticado
  const { first_name, last_name, email, role, cart } = req.user.user;
  console.log("🚀 ~ file: views.router.js:206 ~ routerView.get ~ req.user:", req.user)

  //Busco el id de cart ya que no lo paso por token ya que despues va a cambiar 
  const userFindCart = await UserModel.findOne({ email }).exec();
     
    const limitDefault = 10;
    const pageDefault = 1;
    
    //const findPage = parseInt(req.params.ppg) || parseInt(pageDefault); 
    const findPage = parseInt(req.query.page) || parseInt(pageDefault);
    const findLimit = parseInt(req.query.limit) || parseInt(limitDefault); 
    const sortOrder = req.query.sort == 'desc' ? -1 : 1;
    const queryCategory = req.query.category;
    const queryId =  parseInt(req.query.id);

    //Busco por categoria
    const findCategory = {}; 
    if (queryCategory) {
      findCategory.category = queryCategory;
    };
    // Busco por _id 
    if (queryId) {
      findCategory._id = queryId;
    };
    //Parametros de filtro
    const findBdProd = {
      page: findPage,
      limit: findLimit,
      sort: { price: sortOrder },
      lean: true
    };

    const productsPagination = await productsModel.paginate(findCategory, findBdProd);

    //le paso a respuesta de products los link
    productsPagination.prevLink = productsPagination.hasPrevPage === true
        ? `http://localhost:8080/products/?page=${productsPagination.prevPage}&limit=5&sort=&category=&id=`
        : null;

    productsPagination.nextLink = productsPagination.hasNextPage === true
      ? `http://localhost:8080/products/?page=${productsPagination.nextPage}&limit=5&sort=&category=&id=`
      : null;

    productsPagination.isValid= !(findPage<=0||findPage> productsPagination.totalPages)


    const user = {
      first_name,
      last_name,
      email,
      role,
      cart: userFindCart.cart,
    }

    //Renderizo respuesta
    res.render('products', {user, productsPagination});
   
  } catch(error) {
    console.log(`Error al realizar la búsqueda paginada: ${error}`);

    return res.status(404).json({status:"error",message: `Error al realizar la búsqueda paginada en BBBD ${error}`});
  }
});

   //---------------------PROFILE-------------------------------//
routerView.get("/profile", [passportCall("jwt"), handlePolicies(["ADMIN", "USER", "PUBLIC"])], (req, res) => {
  const { first_name, last_name, email, role } = req.user.user;
  console.log("🚀 ~ file: views.router.js:206 ~ routerView.get ~ req.user:", req.user)
  const user = {
    first_name,
    last_name,
    email,
    role
  };
  console.log("🚀 ~ file: views.router.js:214 ~ routerView.get ~  user:",  user)
  res.render("user/profile", { user });
});


   //---------------------REGISTER-------------------------------//
//routerView.get("/register", auth, async (req, res) => {
routerView.get("/register",  async (req, res) => {
  try {
    res.render("user/register", {
      title: "Registro",
      style: "home",
      logued: false,
    });
  } catch (error) {
    console.error("Error al renderizar el formulario de registro:", error);
    res.status(500).send({ error: "Ocurrió un error al mostrar el formulario de registro" });
  }
});


   //---------------------RECOVER-------------------------------//
routerView.get("/recover", async (req, res) => {
  res.render("user/recover");
})




export default routerView;

