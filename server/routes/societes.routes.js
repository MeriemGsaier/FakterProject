const { societe } = require("../models");

module.exports = function (app) {
  const controllerste = require("../controllers/societe.controller");
  const { authJwt } = require("../middleware");
  var router = require("express").Router();
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/test/all", controllerste.allAccess);
  app.get("/api/test/user", [authJwt.verifyToken], controllerste.userBoard);
  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controllerste.adminBoard
  );

  // Créer une société
  router.post("/create", controllerste.create);
  // fetch d'une société par id
  router.get("/:id", controllerste.findOne);
  // Update a societe with id
  router.put("/:id", controllerste.update);
  app.use("/api/societes", router);
};
