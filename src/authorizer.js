import * as auth from "./util/authenticate";

// Lambda function index.handler - thin wrapper around lib.authenticate
export const main = async (event, context) => {
  let data;

  try {
    data = await auth.authenticate(event);
    console.log("Authorizer:main - policy", data);
  } catch (err) {
    console.log("Authorizer:main", err);
    return context.fail("Unauthorized");
  }
  return data;
};
