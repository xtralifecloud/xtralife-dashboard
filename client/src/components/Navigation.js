import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { BoxArrowInRight } from "react-bootstrap-icons";
import { useAppContext } from "../context/app-context";
import { Link } from "react-router-dom";
import useSession from "../hooks/useSession";
import logo from "./../assets/logo.png";

const Navigation = () => {
  const { user, env, version } = useAppContext();
  const { logout } = useSession();

  return (
    <Navbar collapseOnSelect expand="lg" variant="dark" >
      <Container style={{borderBottom: "1px solid #4e5d6c"}}>
        <Navbar.Brand>
          <div className="d-flex algin-items-center mx-3">
            <Link className="deco-none d-flex align-items-center" to="/">
              <img src={logo} alt="logo" />
            </Link>
            <p style={{marginTop: "1rem", marginLeft: "1rem"}}>{env + "-" + version}</p>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav>
            <NavDropdown title="Games" id="collasible-nav-dropdown">
              <Link className="deco-none" to="/status">
                <NavDropdown.Item as="div">Status</NavDropdown.Item>
              </Link>
              <Link className="deco-none" to="/store">
                <NavDropdown.Item as="div">Store</NavDropdown.Item>
              </Link>
            </NavDropdown>
            <NavDropdown title="Community" id="collasible-nav-dropdown" className="mx-3">
              <Link className="deco-none" to="/users">
                <NavDropdown.Item as="div">Users</NavDropdown.Item>
              </Link>
              <Link className="deco-none" to="/leaderboards">
                <NavDropdown.Item as="div">Leaderboards</NavDropdown.Item>
              </Link>
              {/* <Link className="deco-none" to="/matches">
                <NavDropdown.Item as="div">Matches</NavDropdown.Item>{" "}
              </Link> */}
            </NavDropdown>
            <NavDropdown title="Resources" id="collasible-nav-dropdown">
              <a
                className="deco-none"
                href="https://github.com/xtralifecloud/"
                target="_blank"
                rel="noreferrer"
              >
                <NavDropdown.Item as="div">SDK</NavDropdown.Item>
              </a>
              <a
                className="deco-none"
                href="https://xtralife.cloud"
                target="_blank"
                rel="noreferrer"
              >
                <NavDropdown.Item as="div">Blog</NavDropdown.Item>
              </a>
            </NavDropdown>
            {user && (
              <div className="d-flex align-items-center mx-3">
                <BoxArrowInRight color="rgba(255, 255, 255, 0.55)" />
                <Nav.Link onClick={() => logout()}>Logout</Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
