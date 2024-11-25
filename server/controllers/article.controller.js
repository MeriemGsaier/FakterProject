const db = require("../models");
const article = db.article;


// Create and Save a new article
exports.create = (req, res) => {
  // Validate request
  if (!req.body.nom_article) {
    res.status(400).send({
      message: "contenu vide !",
    });
    return;
  }
  // Create an article
  const art = {
    nom_article: req.body.nom_article,
    type_article: req.body.type_article,
    description: req.body.description,
    archive: req.body.archive,
  };
  article
    .findOne({
      where: {
        nom_article: req.body.nom_article,
      },
    })
    .then((Article) => {
      if (Article) {
        res.status(400).send({
          message: "Echec! la nom de l'article entré existe déjà !",
        });
        return;
      } else {
        // Save article in the database
        article
          .create(art)
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message ||
                "une erreur est survenue lors de la création de l'article.",
            });
          });
      }
    });
};
// Lister les articles et les factures qui leur correspondent
exports.findAll = (req, res) => {
 
  article
    .findAll({ include : ["facture"]})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "une erreur est survenue lors de l'affichage de la liste des articles.",
      });
    });
};

// Lister les articles et tous les prix qui leur correspondent
exports.findAllArticlesPrix = (req, res) => {
 
  article
    .findAll({ include : ["prix"]})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "une erreur est survenue lors de l'affichage de la liste des articles.",
      });
    });
};

// Lister les articles avec prix et dates les plus récents
exports.findAllArticles = (req, res) => {
  article
    .findAll({include: ["prix"] })
    .then((result) => {
      data = result.map((el) => el.get({ plain: true }));
      for (i = 0; i < data.length; i++) {
        if (data[i].prix.length == 0) continue;
        var indice = 0;
        for (j = 1; j < data[i].prix.length; j++) {
          if (data[i].prix[indice].date < data[i].prix[j].date) {
            indice = j;
          }
        }
        var latestPrix = new Array();
        latestPrix.push(data[i].prix[indice]);
        data[i].prix = [];
        latestPrix_obj = { ...latestPrix };
        data[i].prix = latestPrix_obj;
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "une erreur est survenue lors de l'affichage de la liste des articles.",
      });
    });
};

// Modifier un article avec le nom spécifié dans la requête
exports.update = (req, res) => {
  const nom_article = req.params.nom_article;
  article
    .update(req.body, {
      where: { nom_article: nom_article },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "L'article est mis à jour avec succés.",
        });
      } else {
        res.send({
          message: `erreur de mise à jour de l'article avec nom = ${nom_article}. peut être l'article est inexistant ou le corps de la requête est vide!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Erreur  de mise à jour de l'article  avec nom_article = " +
          nom_article,
      });
    });
};
// Supprimer un article avec le nom spécifié dans la requête
exports.delete = (req, res) => {
  const nom_article = req.params.nom_article;
  article
    .destroy({
      where: { nom_article: nom_article },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "L'article est supprimé avec succés!",
        });
      } else {
        res.send({
          message: `Echec de suppression de l'article  avec nom_article = ${nom_article}. Peut être qu'il est inexistant !`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};
