import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { useAppContext } from "../context/app-context";
import { Link } from "react-router-dom";
import useSession from "../hooks/useSession";

const Navigation = () => {

  const {user, env, version} = useAppContext()
  const {logout} = useSession()

  return (
    <Navbar sticky="top" collapseOnSelect expand="lg" style={{backgroundColor: "#00284c"}} variant="dark">
      <Container>
        <Navbar.Brand><Link className="deco-none" to="/">Dashboard-{env}-{version}</Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav>
            <NavDropdown title="Games" id="collasible-nav-dropdown">
              <NavDropdown.Item as='span'><Link className="deco-none" to="/status">Status</Link></NavDropdown.Item>
              <NavDropdown.Item as='span'><Link className="deco-none" to="/store">Store</Link></NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Community" id="collasible-nav-dropdown">
              <NavDropdown.Item as='span'><Link className="deco-none" to="/gamers">Gamers</Link></NavDropdown.Item>
              <NavDropdown.Item as='span'>
                <Link className="deco-none" to="/leaderboards">Leaderboards</Link>
              </NavDropdown.Item>
              <NavDropdown.Item as='span'><Link className="deco-none" to="/matches">Matches</Link></NavDropdown.Item>
            </NavDropdown>
            {user && <Nav.Link onClick={() => logout()}>Logout</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
