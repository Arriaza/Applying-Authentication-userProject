const express = require('express')
const bcrypt = require('bcrypt')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const User = require('./user.model')

const validateJwt = expressJwt({ secret: process.env.SECRET, algorithms: ['HS256'] })

const signToken = _id => jwt.sign({ _id }, process.env.SECRET)

const findAndAssignUser = async (req, res, next) => {
  const userId = req.user && req.user._id
  if(!userId) {
    return res.status(401).json({ message: 'Unauthorized access' })
  }

  User.findById(userId, (err, user) => {
    if(err) {
      return res.status(500).json({ message: 'Error searching for user' })
    }

    req.user = user
    next()
  })
}

// endPoint protection
const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser)

const Auth = {
  login: async (req, res) => {
    const { body } = req
    try {
      const user = await User.findOne({ email: body.email })
      if(!user) {
        res.status(401).send('Invalid username and/or password')
      } else {
        const isMatch = await bcrypt.compare(body.password, user.password)
        if(isMatch) {
          const signed = signToken(user._id)
          res.status(200).send(signed)
        } else {
          res.status(401).send('Invalid username and/or password')
        }
      }
    } catch (e) {
      res.send(e.message)
    }
  },
  register: async (req, res) => {
    const { body } = req
    try {
      const isUser = await User.findOne({ email: body.email })
      if(isUser) {
        res.send('User already exists')
      } else {
        const salt = await bcrypt.genSalt()
        const hashed = await bcrypt.hash(body.password, salt)
        const user = await User.create({ email: body.email, password: hashed, salt })
        const signed = signToken(user._id)
      }
    } catch (err) {
      res.status(500).send(err.message)
    }
  },
}

module.exports = { Auth, isAuthenticated }
