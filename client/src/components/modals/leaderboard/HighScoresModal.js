import React, { useEffect, useState } from "react";
import { Modal, Badge, Button } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import { useAppContext } from "../../../context/app-context";
import { deleteScore, getBestScores } from "../../../services/user";

const HighScoresModal = (props) => {
  const { game, domain } = useAppContext();
  const [hs, setHs] = useState({});

  useEffect(() => {
    if (props.user) {
      (async () => {
        const hs = await getBestScores(game.name, domain, props.user.gamer_id);

        setHs(hs);
      })();
    }
  }, [props.user, domain, game]);

  const deleteHs = async (lb) => {
    deleteScore(game.name, domain, props.user.gamer_id, lb);
    const newHs = { ...hs };
    delete newHs[lb];
    setHs(newHs);
  };

  return props.user ? (
    <Modal
      size="lg"
      show={props.show}
      onHide={() => {
        props.setShowHighScores(false);
        props.setSelectedUser(null);
      }}
    >
      <Modal.Header>HighScores: {props.user.profile.displayName}</Modal.Header>

      <Modal.Body>
        {hs &&
          Object.keys(hs).map((e) => {
            return (
              <div key={`line-${e}`}>
                <h5 className="d-flex justify-content-between">
                  {e}
                  <div className="d-flex align-items-center">
                    <Badge pill className="mx-3">
                      {hs[e].score}
                    </Badge>
                    <Button
                      className="d-flex "
                      variant="danger"
                      style={{ borderRadius: "14px" }}
                      onClick={() => {
                        deleteHs(e);
                      }}
                    >
                      <Trash size={20} />
                    </Button>
                  </div>
                </h5>

                <p className="mb-4">{hs[e].info}</p>
              </div>
            );
          })}
      </Modal.Body>
    </Modal>
  ) : (
    <div></div>
  );
};

export default HighScoresModal;
