import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Table } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getSponsorship } from "../../services/user";
import { useNavigate } from "react-router-dom";

const Sponsorship = ({ refresh }) => {
  const [referrers, setReferrers] = useState([]);
  const [referral, setReferral] = useState(null);
  const { game, domain } = useAppContext();
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getReferrersAsync(game.name, domain, userId);
  }, [game, domain, userId, refresh]);

  const getReferrersAsync = async (gameName, domain, userId) => {
    const res = await getSponsorship(gameName, domain, userId);
    if (res.referrers) setReferrers(res.referrers);
    if (res.referral) {
      setReferral(res.referral);
    } else {
      setReferral(null);
    }
  };

  return (
    <Container>
      <div>
        {referral && (
          <div style={{ marginBottom: "35px" }}>
            <h4>Referral</h4>
            <p className="m-0">
              UserID:{" "}
              <button className="btn-link" onClick={() => navigate(`/gamer/${referral.gamer_id}`)}>
                {referral.gamer_id}
              </button>
            </p>
            {referral.profile?.displayName && (
              <p className="m-0">
                Display name: {referral.profile?.displayName}
              </p>
            )}
            {referral.profile?.email && (
              <p className="m-0">Email: {referral.profile?.email}</p>
            )}
          </div>
        )}
        {referrers && (
          <div>
            <h4>Referrers</h4>
            <Table size="sm" bordered hover borderless responsive>
              <thead>
                <tr>
                  <th style={{ width: "33%" }}>UserID</th>
                  <th style={{ width: "33%" }}>Display Name</th>
                  <th style={{ width: "33%" }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((referrer) => {
                  return (
                    <tr key={`line-${referrer.gamer_id}`}>
                      <td
                        className="clickable"
                        key={`gamer-id-${referrer.gamer_id}`}
                        onClick={() => navigate(`/gamer/${referrer.gamer_id}`)}
                      >
                        {referrer.gamer_id}
                      </td>
                      <td key={`login-${referrer.gamer_id}`}>
                        {referrer.profile?.displayName}
                      </td>
                      <td key={`email-${referrer.gamer_id}`}>
                        {referrer.profile?.email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Sponsorship;
