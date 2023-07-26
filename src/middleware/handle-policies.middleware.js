import passport from "passport";

export default function handlePolicies(roles) {
  return async function (req, res, next) {
    try {
      //Datos del usuario del token JWT
      const userJWT = req.user;
      if (!userJWT || !userJWT.user || !userJWT.user.role) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const userRole = userJWT.user.role;
      // Verifico si el rol del usuario es permitido
      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: "Acceso no autorizado" });
      }
      next();
    } catch (error) {
      console.error("Error en el middleware handlePolicies:", error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  };
}
