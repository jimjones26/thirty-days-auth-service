const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/session", authController.session);
router.post("/refresh-tokens", authController.refresh_tokens);
router.post("/revoke-tokens", authController.revoke_tokens);

module.exports = router;
