const express = require("express");
const router = express.Router();


router.get("/" , (req,res) => {
  res.send(" user root");

});
router.get("/:id" , (req,res) => {
  res.send("users id");

});
router.post("/" , (req,res) => {
  res.send("users new");

});
router.delete("/:id" , (req,res) => {
  res.send(" user delete");

});

module.exports = router;