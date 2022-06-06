module.exports = function (app) {
    const controllerprx = require("../controllers/prixarticle.controller")
    const { authJwt } = require("../middleware");
    var router = require("express").Router();
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
    
    
      // Create 
       router.post("/create", controllerprx.create);
       // fetch all devises with dates
       router.get("/", controllerprx.findAll);
      // // fetch all 
      // router.get("/", controllerddev.findAll);
      app.use("/api/prix", router);
    };