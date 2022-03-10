import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";
import { useState } from "react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  return <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>;
};

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();

  const [state, setState] = useState({
    apiMessage: "",
    error: null,
    loading: false,
  });
  const { getAccessTokenSilently } = useAuth0();

  const callApi = async () => {
    setState({
      ...state,
      loading: true,
    });
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${process.env.REACT_APP_API_GATEWAY}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        loading: false,
        apiMessage: responseData,
      });
    } catch (error) {
      console.log("error", error);
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  return (
    <div className="App">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <header>React app</header>
          {isAuthenticated ? "welcome back" + user.name : <LoginButton />}
          {isAuthenticated && <LogoutButton />}
          <div className="mb-5">
            <h1>External API</h1>
            <p className="lead">Ping an external API by clicking the button below.</p>

            {!process.env.REACT_APP_AUTH0_AUDIENCE && (
              <div>
                <p>
                  You can't call the API at the moment because your application does not have any configuration for{" "}
                  <code>audience</code>, or it is using the default value of <code>YOUR_API_IDENTIFIER</code>. You might
                  get this default value if you used the "Download Sample" feature of{" "}
                  <a href="https://auth0.com/docs/quickstart/spa/react">the quickstart guide</a>, but have not set an
                  API up in your Auth0 Tenant. You can find out more information on{" "}
                  <a href="https://auth0.com/docs/api">setting up APIs</a> in the Auth0 Docs.
                </p>
                <p>
                  The audience is the identifier of the API that you want to call (see{" "}
                  <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
                    API Authorization Settings
                  </a>{" "}
                  for more info).
                </p>

                <p>In this sample, you can configure the audience in a couple of ways:</p>
                <ul>
                  <li>
                    in the <code>src/index.js</code> file
                  </li>
                  <li>
                    by specifying it in the <code>auth_config.json</code> file (see the{" "}
                    <code>auth_config.json.example</code> file for an example of where it should go)
                  </li>
                </ul>
                <p>
                  Once you have configured the value for <code>audience</code>, please restart the app and try to use
                  the "Ping API" button below.
                </p>
              </div>
            )}

            <button color="primary" className="mt-5" onClick={callApi}>
              Ping API
            </button>
          </div>

          <div className="result-block-container">
            {state.error === "login_required" && <div>You need to be log in</div>}
            {state.loading && <div>loading...</div>}
            {!state.loading && state.apiMessage && (
              <div className="result-block" data-testid="api-result">
                <h6 className="muted">Result</h6>
                <p>
                  <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
