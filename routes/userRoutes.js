const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

const router = express.Router()

/* router.param('id', userController.checkID) */
router.post('/login', authController.login)
router.post('/create-tokens', authController.create_tokens)
router.post('/refresh-tokens', authController.refresh_tokens)
router.post('/revoke-tokens', authController.revoke_tokens)

router.route('/').post(userController.createUser)

router.route('/:id').get(userController.getUserById)

module.exports = router
