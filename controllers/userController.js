const { gqlClient } = require('./../graphql/index')
const catchAsync = require('./../utils/catchAsync')

exports.createUser = (req, res) => {
  console.log('req.body: ', req.body)
  res.send('create user response')
}

exports.getUserById = (req, res) => {
  // take the id and check to see if there is  user with it
  console.log(req.params.id)

  res.send('get user response')
}
