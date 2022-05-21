const db = require("../models");
const comptebancaire = db.comptebancaire;
const Op = db.Sequelize.Op;
// Créer et enregistrer un compte bancaire
exports.create = (req, res) => {
  console.log(req.body);
  if (!req.body.num_compte) {
    res.status(400).send({
      message: "Contenu vide !",
    });
    return;
  }

  const compteb = {
    num_compte: req.body.num_compte,
    rib: req.body.rib,
    bic: req.body.bic,
    iban: req.body.iban,
    nom_banque: req.body.nom_banque,
  };

  comptebancaire
    .create(compteb)
    .then((data) => {
      res.send(data);
      console.log("ajout avec succés");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "une erreur est survenue lors de la création du compte bancaire.",
      });
    });
};
// Lister les comptes bancaires
exports.findAll = (req, res) => {
  const num_compte = req.query.num_compte;
  var condition = num_compte
    ? { num_compte: { [Op.iLike]: `%${num_compte}%` } }
    : null;
  comptebancaire
    .findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "une erreur est survenue lors de l'affichage.",
      });
    });
};

// Modifier un compte bancaire
exports.update = (req, res) => {
  const num_compte = req.params.num_compte;
  comptebancaire
    .update(req.body, {
      where: { num_compte: num_compte },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Le compte bancaire est mis à jour avec succés.",
        });
      } else {
        res.send({
          message: `erreur de mise à jour de du compte avec numCompte=${num_compte}. peut etre le compte est inexistant  ou le corps de la requête est vide!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Erreur de mise à jour du compte avec numCompte=" + num_compte,
      });
    });
};
// Supprimer un compte bancaire
exports.delete = (req, res) => {
  const num_compte = req.params.num_compte;
  comptebancaire
    .destroy({
      where: { num_compte: num_compte },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "le Compte bancaire est supprimé avec succés!",
        });
      } else {
        res.send({
          message: `Echec de suppression du compte bancaire avec numCompte=${num_compte}. Peut être qu'il est inexistant !`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Echec de suppression du compte bancaire avec numCompte=" +
          num_compte,
      });
    });
};
// Supprimer Tout
exports.deleteAll = (req, res) => {
  comptebancaire
    .destroy({
      where: {},
      truncate: false,
    })
    .then((nums) => {
      res.send({
        message: `${nums} Tous les comptes bancaires sont supprimés avec succés !`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Une erreur est survenue lors de la suppression des comptes bancaires",
      });
    });
};

