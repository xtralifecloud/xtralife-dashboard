import React, { useState, useEffect } from "react";
import {
  Container,
  ButtonGroup,
  Button,
  Spinner,
  Table,
  FormCheck,
} from "react-bootstrap";
import { People, Trash, Chat } from "react-bootstrap-icons";
import { useAppContext } from "../context/app-context";
import { deleteUser, getUsers } from "../services/user";
import { isPresent } from "../utils/isPresent";
import Paginate from "../components/Paginate";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const { game } = useAppContext();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(10);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getRangeUsers = async (skip, limit) => {
      if (game.name) {
        const users = await getUsers(game.name, skip, limit);
        setUsers(users);
        setLoading(false);
      }
    };
    const skip = (page - 1) * itemsNumber;
    getRangeUsers(skip, itemsNumber);
  }, [game, itemsNumber, page]);

  useEffect(() => {
    if (selectedUsers.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [selectedUsers]);

  const handleSelection = (e, userId) => {
    if (e.target.checked) {
      setSelectedUsers((selectedUsers) => [...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };
  
  const bulkDeleteUser = () => {
    for(const user_id of selectedUsers) {
      deleteUser(game.name, user_id);
    }
  }

  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <People className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Users</h1>
      </div>

      <div className="d-flex justify-content-between my-5">
        <ButtonGroup aria-label="import-export">
          <Button variant="danger" disabled={buttonDisabled} onClick={() => bulkDeleteUser()}>
            <Trash size={20} /> Delete {selectedUsers.length} users
          </Button>
          <Button variant="secondary" disabled={buttonDisabled}>
            <Chat size={20} /> Message {selectedUsers.length} users
          </Button>
        </ButtonGroup>
      </div>

      {loading ? (
        <Spinner animation="border" variant="outline-primary" />
      ) : isPresent([users]) && users.total === 0 ? (
        <p>You don't have any user yet</p>
      ) : (
        <div>
          <Table size="sm" bordered hover borderless responsive>
            <thead>
              <tr>
                <th></th>
                <th>UserID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Language</th>
                <th>Linked to</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              {users.list.map((user, i) => {
                return (
                  <tr id={`line-${i}`} key={`line-${i}`}>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <FormCheck.Input
                          type="checkbox"
                          onClick={(e) => handleSelection(e, user._id)}
                        />
                      </div>
                    </td>
                    <td
                      onClick={() => navigate(`/gamer/${user._id}`)}
                      key={`id-${i}`}
                    >
                      {user._id}
                    </td>
                    <td key={`name-${i}`}>{user.profile.displayName}</td>
                    <td key={`email-${i}`}>{user.profile.email}</td>
                    <td key={`lang-${i}`}>{user.profile.lang}</td>
                    <td key={`linkedto-${i}`}></td>
                    <td key={`events-${i}`}>
                      {user.mqPending}/{user.mqTimedout}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Paginate
            page={page}
            setPage={setPage}
            itemsNumber={itemsNumber}
            setItemsNumber={setItemsNumber}
            totalItems={users.total}
          />
        </div>
      )}
    </Container>
  );
};

export default Users;
