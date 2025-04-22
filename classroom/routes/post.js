const express = require("express");
const router = express.Router();

router.get("/" , (req,res) => {
  res.send("posts root");

});
router.get("/:id" , (req,res) => {
  res.send("post id");

});
router.post("/" , (req,res) => {
  res.send("post new");

});
router.delete("/:id" , (req,res) => {
  res.send("poost delete");

});

module.exports = router;