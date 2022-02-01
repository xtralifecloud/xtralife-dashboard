import React, { useState } from "react";
import { Form, Button} from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import useSession from "../hooks/useSession";
import "./../styles/table.scss";
import { toast } from "react-toastify";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ggcode, setGgcode] = useState("");
  const { login } = useSession();

  const handleClick = (e) => {
    e.preventDefault();
    if (username === "") toast.warn("Username should not be empty");
    if (password === "") toast.warn("Password should not be empty");

    if (username && password) {
      login(username, password, ggcode);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="d-flex align-items-center justify-content-center mb-5">
        <Person className="mx-1" size={40} />
        <h2 className="m-0 mx-1">Sign in</h2>
      </div>
      <Form className="mx-3 max-w-600px d-flex flex-column align-items-center">
        <Form.Group className="mb-3 w-100">
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
          type="submit"
          onClick={(e) => handleClick(e)}
        >
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
