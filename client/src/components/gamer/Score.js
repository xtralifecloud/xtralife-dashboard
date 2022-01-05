import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Table, FormCheck, Button } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getBestScores, deleteScore } from "../../services/user";
import {Trash} from "react-bootstrap-icons";

const Score = () => {
  const [scores, setScores] = useState(null);
  const { game, domain } = useAppContext();
  const { userId } = useParams();
  const [selectedScores, setSelectedScores] = useState([]);
  const [deleteDisabled, setDeleteDisabled] = useState(true);

  useEffect(() => {
    const getRangeTx = async () => {
      if (game.name) {
        const scores = await getBestScores(game.name, domain, userId);
        setScores(scores);
      }
    };
    getRangeTx();
  }, [game, domain, userId]);
  
  useEffect(() => {
		if(selectedScores.length === 0){
			setDeleteDisabled(true);
		}else{
			setDeleteDisabled(false);
		}
	}, [selectedScores])

  const handleSelection = (e, key) => {
    if (e.target.checked) {
      setSelectedScores((selectedScores) => [...selectedScores, key]);
    } else {
      setSelectedScores(selectedScores.filter((value) => value !== key));
    }
  };

  const bulkDeleteScores = () => {
		for (const lb of selectedScores) {
      deleteScore(game.name, domain, userId, lb)
      setScores(scores => {
        const newScores = {...scores};
        delete newScores[lb]
        return newScores
      });
    }
    setSelectedScores([])
  }

  return (
    <Container>
      {scores && (
        <div>
          <Button
            variant="danger"
            disabled={deleteDisabled}
            onClick={() => bulkDeleteScores()}
            className="mb-3"
          >
            <Trash size={20} /> Delete {selectedScores.length} scores
          </Button>
          <Table size="sm" bordered hover borderless responsive>
            <thead>
              <tr>
                <th style={{ width: "3%" }}></th>
                <th style={{ width: "17%" }}>LeaderBoard</th>
                <th style={{ width: "5%" }}>Score</th>
                <th style={{ width: "5%" }}>Rank</th>
                <th style={{ width: "75%" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(scores).map((key) => {
                return (
                  <tr key={`line-${scores[key].timestamp}`}>
                    <td key={`checkbox-${scores[key].timestamp}`}>
                      <div className="d-flex align-items-center justify-content-center">
                        <FormCheck.Input
                          type="checkbox"
                          onClick={(e) => handleSelection(e, key)}
                        />
                      </div>
                    </td>
                    <td key={`key-${scores[key].timestamp}`}>{key}</td>
                    <td key={`score-${scores[key].timestamp}`}>
                      {scores[key].score}
                    </td>
                    <td key={`rank-${scores[key].timestamp}`}>
                      {scores[key].rank}
                    </td>
                    <td key={`desc-${scores[key].timestamp}`}>
                      {scores[key].info}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default Score;
