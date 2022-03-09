import jwt from "jsonwebtoken";
import handler from "./util/handler";
import jwksClient from "jwks-rsa";

const generatePolicy = (principalId, methodArn) => {
  console.log("principalId", principalId);
  console.log("methodArn", methodArn);

  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: methodArn,
        },
      ],
    },
  };
};

const client = jwksClient({
  jwksUri: "jwksUri",
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, function (err, key) {
    console.log("err", err);
    console.log("key", key);
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

export const main = handler(async (event) => {
  if (!event.authorizationToken) {
    throw "Unauthorized";
  }

  console.log("requestContext", event.requestContext);

  const token = event.authorizationToken.replace("Bearer ", "");

  console.log("token", token);

  try {
    return jwt.verify(
      token,
      getKey,
      {
        audience: "audience",
        issuer: "issuer",
        algorithms: ["RS256"],
      },
      function (err, claims) {
        console.log("err", err);
        console.log("claims:", claims);
        if (claims) {
          const policy = generatePolicy(claims.sub, event.methodArn);

          console.log("Policy", JSON.stringify(policy));

          return {
            ...policy,
            context: {
              scope: "FULL_LIST_OF_SCOPES",
            },
          };
        }
        throw "Unauthorized";
      }
    );
  } catch (error) {
    console.log(error);
    throw "Unauthorized";
  }
});
