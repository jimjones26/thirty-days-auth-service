const { gqlClient } = require('./../graphql/index')
const { GET_ALL_USERS } = require('./../graphql/queries/queries')
const catchAsync = require('./../utils/catchAsync')

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await gqlClient(GET_ALL_USERS).then(data => data.data.td_users)
  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  })
})

exports.createUser = (req, res) => {
  console.log('req.body: ', req.body)
  res.send('create user response')
}

exports.getUserById = (req, res) => {
  // take the id and check to see if there is  user with it
  console.log(req.params.id)

  res.send('get user response')
}
