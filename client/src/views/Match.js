import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/app-context";
import { useParams } from "react-router-dom";
import { getMatch, putMatch } from "../services/match";
import { Controller, ArrowLeft } from "react-bootstrap-icons";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import JSONEditorModal from "../components/modals/JSONEditorModal";
import { useNavigate } from "react-router-dom";

const Match = () => {
  const { game } = useAppContext();

  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventId, setEventId] = useState(null);

  const [description, setDescription] = useState("");
  const [customProperties, setCustomProperties] = useState({});
  const [globalState, setGlobalState] = useState({});

  const [showPropertiesEditor, setShowPropertiesEditor] = useState(false);
  const [showGlobalStateEditor, setShowGlobalStateEditor] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getMatchAsync(game.name, matchId);
  }, [game, matchId]);

  const getMatchAsync = async (gameName, matchId) => {
    const match = await getMatch(gameName, matchId);
    if (match) setMatch(match);
    if (match.description) setDescription(match.description);
    if (match.customProperties) setCustomProperties(match.customProperties);
    if (match.globalState) setGlobalState(match.globalState);
  };

  const updateMatch = async () => {
    const updatedMatch = await putMatch(game.name, matchId, { description, customProperties, globalState });
    if (updatedMatch) getMatchAsync(game.name, matchId);
  };

  return (
    <Container className="my-5">
      <div className="position-relative">
        <div style={{ position: "absolute", left: "0" }} onClick={() => navigate(-1)}>
          <ArrowLeft size={30} className="arrow-back clickable" />
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <Controller className="mx-1" size={50} />
          <h1 className="m-0 mx-1">Match</h1>
        </div>
        <h4 className="text-center mt-4 mb-5">
          id: {matchId} / status: {match?.status}
        </h4>
      </div>

      {match && (
        <div>
          <div className=" d-flex align-items-center" style={{ width: "80%" }}>
            <p className="m-3 text-end" style={{ width: "35%" }}>
              Description
            </p>
            <Form.Control type="text" defaultValue={description} onChange={(e) => {
                  setDescription(e.target.value);
                }}placeholder="Description" />
          </div>
          <div className=" d-flex align-items-center" style={{ width: "80%" }}>
            <p className="m-3 text-end" style={{ width: "35%" }}>
              Properties (JSON)
            </p>
            <Form.Control
              type="text"
              value={JSON.stringify(customProperties)}
              placeholder="Properties (JSON)"
              readOnly
              onClick={() => setShowPropertiesEditor(true)}
            />
          </div>
          <div className=" d-flex align-items-center" style={{ width: "80%" }}>
            <p className="m-3 text-end" style={{ width: "35%" }}>
              Global state (JSON)
            </p>
            <Form.Control
              type="text"
              value={JSON.stringify(globalState)}
              placeholder="Global state (JSON)"
              readOnly
              onClick={() => setShowGlobalStateEditor(true)}
            />
          </div>

          <div className="d-flex justify-content-end my-3 mx-5">
            <Button onClick={() => updateMatch()}>Save Changes</Button>
          </div>

          <h4 className="mt-5">
            Players ({match.players?.length} out of {match.maxPlayers})
          </h4>
          <Table size="sm" bordered hover borderless responsive className="my-3">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Gamer ID</th>
                <th style={{ width: "50%" }}>Name</th>
              </tr>
            </thead>
            <tbody>
              {match.players?.map((player) => (
                <tr key={`line-${player.gamer_id}`}>
                  <td key={`id-${player.gamer_id}`}>{player.gamer_id}</td>
                  <td key={`name-${player.gamer_id}`}>{player.profile?.displayName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h4 className="mt-5">Event History</h4>
          <Table size="sm" bordered hover borderless responsive className="my-3">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Type</th>
                <th style={{ width: "50%" }}>Player ID</th>
              </tr>
            </thead>
            <tbody>
              {match.events?.map((event, index) => (
                <tr
                  key={`line-${event.event._id}`}
                  onClick={() => {
                    setEventId(index);
                    setShowModal(true);
                  }}
                  className="clickable"
                >
                  <td key={`id-${event.event._id}`}>{event.type}</td>
                  <td key={`name-${event.event._id}`}>{event.event?.player_id}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {match && eventId !== null && (
        <Modal
          size="lg"
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEventId(null);
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <pre>{JSON.stringify(match.events[eventId], null, 2)}</pre>
          </Modal.Body>
        </Modal>
      )}

      <JSONEditorModal
        show={showPropertiesEditor}
        setShow={setShowPropertiesEditor}
        value={customProperties}
        setValue={setCustomProperties}
        title="Properties"
      />
      <JSONEditorModal
        show={showGlobalStateEditor}
        setShow={setShowGlobalStateEditor}
        value={globalState}
        setValue={setGlobalState}
        title="Properties"
      />
    </Container>
  );
};

export default Match;
