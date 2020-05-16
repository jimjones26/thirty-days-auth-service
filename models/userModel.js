const { gqlClient } = require("./../graphql/index");
const {
  GET_USER_BY_EMAIL,
  INSERT_USER,
  GET_USER_BY_ID,
  INCREMENT_TOKEN_VERSION,
} = require("./../graphql/queries/queries");

exports.getUserById = (id) => {
  return gqlClient(
    GET_USER_BY_ID,
    { "Content-Type": "application/json" },
    {
      id,
    }
  ).then((resAsJson) => {
    if (resAsJson.data.td_users.length > 0) {
      return resAsJson.data.td_users[0];
    } else {
      throw new Error("user not found");
    }
  });
};

exports.getUserByEmail = (email) => {
  return gqlClient(
    GET_USER_BY_EMAIL,
    { "Content-Type": "application/json" },
    {
      email,
    }
  ).then((resAsJson) => {
    if (resAsJson.data.td_users.length > 0) {
      return resAsJson.data.td_users[0];
    } else {
      return null;
    }
  });
};

exports.revokeRefreshToken = (id, tokenVersion) => {
  return gqlClient(
    INCREMENT_TOKEN_VERSION,
    { "Content-Type": "application/json" },
    {
      id,
      tokenVersion,
    }
  ).then((resAsJson) => resAsJson.data.update_td_users.returning[0]);
};

const createNewUser = (email) => {
  return gqlClient(
    INSERT_USER,
    { "Content-Type": "application/json" },
    {
      email,
    }
  ).then((resAsJson) => {
    if (resAsJson.data.insert_td_users.returning.length > 0) {
      return resAsJson.data.insert_td_users.returning[0];
    } else {
      throw Error("user not created");
    }
  });
};
