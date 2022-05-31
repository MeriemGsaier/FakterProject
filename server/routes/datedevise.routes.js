module.exports = function (app) {
    const controllerddev = require("../controllers/datedevise.controller")
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
     router.post("/create", controllerddev.create);
    // fetch all 
    router.get("/", controllerddev.findAll);
    // Update with nom
    router.put("/:id", controllerddev.update);
    // Delete  with id
    router.delete("/:id", controllerddev.delete);
    // Delete all 
    router.delete("/", controllerddev.deleteAll);
    app.use("/api/datedevises", router);
  };