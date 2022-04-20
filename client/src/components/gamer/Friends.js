import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Table, FormCheck, Button } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getFriends, deleteFriend } from "../../services/user";
import { Trash } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const Friend = ({ refresh }) => {
  const [friends, setFriends] = useState([]);
  const { game, domain } = useAppContext();
  const { userId } = useParams();
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getFriendsAsync(game.name, domain, userId);
  }, [game, domain, userId, refresh]);

  const getFriendsAsync = async (gameName, domain, userId) => {
    const res = await getFriends(gameName, domain, userId);
    if (res.friends) setFriends(res.friends);
    if (res.blackList) {
      const blacklist = res.blackList.map((user) => {
        user.blacklisted = true;
        return user;
      });
      setFriends((friends) => friends.concat(blacklist));
    }
  };

  useEffect(() => {
    if (selectedFriends.length === 0) {
      setDeleteDisabled(true);
    } else {
      setDeleteDisabled(false);
    }
  }, [selectedFriends]);

  const handleSelection = (e, key) => {
    if (e.target.checked) {
      setSelectedFriends((selectedFriends) => [...selectedFriends, key]);
    } else {
      setSelectedFriends(selectedFriends.filter((value) => value !== key));
    }
  };

  const bulkDeleteFriends = async () => {
    for (const friend_id of selectedFriends) {
      await deleteFriend(game.name, domain, userId, friend_id);
    }
    await getFriendsAsync(game.name, domain, userId);
    setSelectedFriends([]);
  };

  return (
    <Container>
      {friends && (
        <div>
          <Button
            variant="danger"
            disabled={deleteDisabled}
            onClick={() => bulkDeleteFriends()}
            className="d-flex align-items-center mb-3"
          >
            <Trash size={20} className="mr-2" /> Delete {selectedFriends.length}{" "}
            {selectedFriends.length === 1 ? "friend" : "friends"}
          </Button>
          <Table size="sm" bordered hover borderless responsive>
            <thead>
              <tr>
                <th style={{ width: "3%" }}></th>
                <th>UserID</th>
                <th>Display Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {friends.map((friend) => {
                return (
                  <tr key={`line-${friend.gamer_id}`} className={`${friend.blacklisted ? "red-background" : ""}`}>
                    <td key={`checkbox-${friend.gamer_id}`}>
                      <div className="d-flex align-items-center justify-content-center">
                        <FormCheck.Input
                          type="checkbox"
                          onClick={(e) => handleSelection(e, friend.gamer_id)}
                        />
                      </div>
                    </td>
                    <td
                      className="clickable"
                      key={`gamer-id-${friend.gamer_id}`}
                      onClick={() => navigate(`/gamer/${friend.gamer_id}`)}
                    >
                      {friend.gamer_id}
                    </td>
                    <td key={`login-${friend.gamer_id}`}>
                      {friend.profile?.displayName}
                    </td>
                    <td key={`email-${friend.gamer_id}`}>
                      {friend.profile?.email}
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

export default Friend;
