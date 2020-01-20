const endpointUrl = 'http://localhost:8080/v1/graphql'
const fetch = require('node-fetch')

module.exports.gqlClient = function(
  queryObject,
  headersObject = {
    'Content-Type': 'application/json'
  },
  variablesObject = null
) {
  /* console.log(
    `queryObject is ${queryObject}, headersObject is ${headersObject}, variablesObject is ${variablesObject}`
  ) */
  return fetch(endpointUrl, {
    method: 'POST',
    headers: headersObject,
    body: JSON.stringify({
      query: queryObject,
      variables: variablesObject
    })
  }).then(res => {
    return res.json()
  })
}
