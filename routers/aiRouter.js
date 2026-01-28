const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/aiController");
const { checkLogin } = require("../middlewares/auth");

router.post("/chat", checkLogin, chatWithAI);

module.exports = router;
