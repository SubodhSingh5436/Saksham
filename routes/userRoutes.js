const express = require('express')
const router = express.Router()
const userController = require('../controllers/usersController')


router.route('/')
    .get(userController.getAllUsers)   //read
    .post(userController.createNewUsers)  //create
    .patch(userController.updateUsers) //update
    .delete(userController.deleteUsers)//delete

module.exports = router


