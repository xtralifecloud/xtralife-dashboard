import React from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { updateUserProfile } from "../../services/user";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";

const Profile = ({ gamer, setGamer }) => {
  const { game } = useAppContext();
  const { userId } = useParams();

  return (
    <Container className="d-flex justify-content-center">
      {gamer && (
        <Form className="w-75" style={{ textAlign: "right" }}>
          <Form.Group
            as={Row}
            className="mb-3 justify-content-right"
            controlId="avatar"
          >
            <Form.Label column sm="2">
              Avatar
            </Form.Label>
            <Col sm="10" style={{ textAlign: "left" }}>
              <Form.Control
                type="text"
                placeholder="Avatar URL"
                defaultValue={gamer.avatar}
                onChange={(e) => setGamer({ ...gamer, avatar: e.target.value })}
              />
              {gamer.avatar && (
                <img
                  src={gamer.avatar}
                  alt="avatar"
                  style={{ width: "100px" }}
                  className="mt-1"
                ></img>
              )}
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="email">
            <Form.Label column sm="2">
              Email
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="email"
                defaultValue={gamer.email}
                placeholder="Email address"
                onChange={(e) => setGamer({ ...gamer, email: e.target.value })}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="displayName">
            <Form.Label column sm="2">
              Display Name
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="text"
                defaultValue={gamer.displayName}
                placeholder="Display Name"
                onChange={(e) =>
                  setGamer({ ...gamer, displayName: e.target.value })
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="firstName">
            <Form.Label column sm="2">
              First Name
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="text"
                defaultValue={gamer.firstName}
                placeholder="First Name"
                onChange={(e) =>
                  setGamer({ ...gamer, firstName: e.target.value })
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="lastName">
            <Form.Label column sm="2">
              Last Name
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="text"
                defaultValue={gamer.lastName}
                placeholder="Last Name"
                onChange={(e) =>
                  setGamer({ ...gamer, lastName: e.target.value })
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="address">
            <Form.Label column sm="2">
              Address
            </Form.Label>
            <Col sm="10">
              <Form.Control
                className="mb-1"
                type="text"
                placeholder="Address"
                defaultValue={gamer.addr1}
                onChange={(e) =>
                  setGamer({ ...gamer, addr1: e.target.value })
                }
              />
              <Form.Control
                className="mb-1"
                type="text"
                placeholder="Address"
                defaultValue={gamer.addr2}
                onChange={(e) =>
                  setGamer({ ...gamer, addr2: e.target.value })
                }
              />
              <Form.Control
                type="text"
                placeholder="Address"
                defaultValue={gamer.addr3}
                onChange={(e) =>
                  setGamer({ ...gamer, addr3: e.target.value })
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="language">
            <Form.Label column sm="2">
              Language
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="text"
                defaultValue={gamer.lang}
                placeholder="Language"
                onChange={(e) =>
                  setGamer({ ...gamer, lang: e.target.value })
                }
              />
            </Col>
          </Form.Group>
          <hr />

          <Button
            variant="primary"
            className="mx-4"
            onClick={() => updateUserProfile(game.name, userId, gamer)}
          >
            Save
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default Profile;
