const User = require('../models/user')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc    Get all users
// @route   GET /users
// @access  Private

const getAllUsers = asyncHandler( async (req,res) => {
     const user = await User.find().select('-password').lean()
     if ( !user?.length){
        return res.status(404).json({ message: 'No users found' })
     }

     res.json( user )
})

// @desc    Create new users
// @route   POST /users
// @access  Private

const createNewUsers = asyncHandler( async (req,res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: 'All fields are required' })
    }

    //check for duplicates 
    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate){
        return res.status(400).json({message: 'Username already exists'})
    }

    //hash password
    const hashedPwd = await bcrypt.hash(password, 10)  //salt rounds

    const userObject = { username, "password": hashedPwd, roles }

    //Create and store new user
    const user = await User.create(userObject)

    if(user){
        res.status(201).json({message: `New User ${username} created`})
    } else {
        res.status(400).json({message: 'Invalid user data received'})
    }
})

// @desc    Update users
// @route   PATCH /users
// @access  Private

const updateUsers = asyncHandler( async (req,res) => {
    const { id, username, roles, active, password } = req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await User.findById(id).exec()

    if ( !user ){
        return res.status(400).json({ message: 'User not found' })
    }

    //check for duplicates
    const duplicate = await User.findOne({username}).lean().exec()
    //Allow updates to the original user
    if ( duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Username already exists' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        //Hash password
        user.password = await bcrypt.hash(password, 10) //salt rounds
    }

    const updatedUser = await user.save()

    res.json({ message: ` ${updatedUser.username} updated` })
})

// @desc    delete users
// @route   delete /users
// @access  Private

const deleteUsers = asyncHandler( async (req,res) => {
    const { id } = req.body

    if(!id){
        return res.status(400).json({ message: 'user ID Required' })
    }

    const note = await Note.findOne({user: id}).lean().exec()

    if(note){
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({ message: 'User not found' })
     }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id } deleted`

    res.json(reply)
})


module.exports = {
    getAllUsers,
    createNewUsers,
    updateUsers,
    deleteUsers
}