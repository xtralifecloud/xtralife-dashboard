import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import useSession from "../hooks/useSession";
import "./../styles/table.scss";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ggcode, setGgcode] = useState("");
  const [missing, setMissing] = useState([]);
  const { login } = useSession();

  const handleClick = () => {
    if (username === "") setMissing((missing) => [...missing, "Username"]);
    if (password === "") setMissing((missing) => [...missing, "Password"]);

    if (username && password) {
      login(username, password, ggcode);
    }
  };

  return (
    <Container className="container-height-100-vh d-flex flex-column justify-content-center align-items-center">
      <div className="d-flex align-items-center justify-content-center mb-5">
        <Person className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Sign in</h1>
      </div>

      <Form className="mx-3 max-w-600px d-flex flex-column align-items-center">
        <Form.Group className="mb-3 w-100">
          {missing.length > 0 && (
            <Alert variant="warning">
              <p>This inputs should not be emtpy: </p>
              <ul>
                {missing.map((e, i) => {
                  return <li key={i}>{e}</li>;
                })}
              </ul>
            </Alert>
          )}
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3 w-100">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3 w-100" style={{display: "none"}}>
          <Form.Label>2FA code (optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="2FA code"
            value={ggcode}
            onChange={(e) => {
              setGgcode(e.target.value);
            }}
          />
        </Form.Group>

        <Button
          className="w-50"
          variant="primary"
          onClick={() => handleClick()}
        >
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
