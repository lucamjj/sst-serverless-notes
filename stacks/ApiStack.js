import * as apigAuthorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as sst from "@serverless-stack/resources";
import { Duration } from "aws-cdk-lib";

export default class ApiStack extends sst.Stack {
  // Public reference to the API
  api;

  constructor(scope, id, props) {
    super(scope, id, props);

    const { table } = props;

    const authorizer = new sst.Function(this, "AuthorizerFn", {
      handler: "src/authorizer.main",
    });

    // Create the API
    this.api = new sst.Api(this, "Api", {
      defaultAuthorizationType: sst.ApiAuthorizationType.CUSTOM,
      defaultAuthorizer: new apigAuthorizers.HttpLambdaAuthorizer("Authorizer", authorizer, {
        authorizerName: "LambdaAuthorizer",
        resultsCacheTtl: Duration.seconds(0),
      }),
      defaultFunctionProps: {
        environment: {
          TABLE_NAME: table.tableName,
        },
      },
      routes: {
        "POST   /notes": "src/create.main",
        "GET    /notes/{id}": "src/get.main",
        "GET    /notes": "src/list.main",
        "PUT    /notes/{id}": "src/update.main",
        "DELETE /notes/{id}": "src/delete.main",
      },
    });

    // Allow the API to access the table
    this.api.attachPermissions([table]);

    // Show the API endpoint in the output
    this.addOutputs({
      ApiEndpoint: this.api.url,
    });
  }
}
