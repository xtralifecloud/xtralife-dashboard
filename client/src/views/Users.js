import React, { useState, useEffect } from "react";
import {
  Container,
  ButtonGroup,
  Button,
  Spinner,
  Table,
  FormCheck,
  Form,
} from "react-bootstrap";
import {
  People,
  Trash,
  Chat,
  Search,
  PencilSquare,
} from "react-bootstrap-icons";
import { useAppContext } from "../context/app-context";
import { deleteUser, getUsers, searchUsers, findUser } from "../services/user";
import { isPresent } from "../utils/isPresent";
import Paginate from "../components/Paginate";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const { game, page, setPage, itemsNumber, setItemsNumber } = useAppContext();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState(null);
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
    for (const user_id of selectedUsers) {
      deleteUser(game.name, user_id);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    if (search === null || search === "") {
      const skip = (page - 1) * itemsNumber;
      const users = await getUsers(game.name, skip, itemsNumber);
      setUsers(users);
      setLoading(false);
    } else if (/^\d+$/.test(search)) {
      const users = await searchUsers(game.name, 0, 0, search);
      setUsers(users);
      setLoading(false);
    } else {
      const user = await findUser(game.name, search);
      setUsers(user);
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <People className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Users</h1>
      </div>

      <div className="d-flex justify-content-between my-5">
        <ButtonGroup aria-label="import-export">
          <Button
            variant="danger"
            disabled={buttonDisabled}
            onClick={() => bulkDeleteUser()}
            className="d-flex align-items-center"
          >
            <Trash size={20} className="mr-2" /> Delete {selectedUsers.length} users
          </Button>
          <Button variant="secondary" disabled={buttonDisabled} className="d-flex align-items-center">
            <Chat size={20} className="mr-2"/> Message {selectedUsers.length} users
          </Button>
        </ButtonGroup>
        <div className="d-flex">
          <Form.Control
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" onClick={() => handleSearch()}  className="d-flex align-items-center">
            <Search size={15} />
          </Button>
        </div>
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
                  <tr id={`line-${i}`} key={`line-${user._id}`}>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <FormCheck.Input
                          type="checkbox"
                          onClick={(e) => handleSelection(e, user._id)}
                        />
                      </div>
                    </td>
                    <td key={`id-${user._id}`} className="d-flex justify-content-between">
                      {user._id}
                      <button
                        onClick={() => navigate(`/gamer/${user._id}`)}
                        className="remove-btn-css mr-2 d-flex algin-items-center"
                      >
                        <PencilSquare size={20}/>
                      </button>
                    </td>
                    <td key={`name-${user._id}`}>{user.profile.displayName}</td>
                    <td key={`email-${user._id}`}>{user.profile.email}</td>
                    <td key={`lang-${user._id}`}>{user.profile.lang}</td>
                    <td key={`linkedto-${user._id}`}></td>
                    <td key={`events-${user._id}`}>
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
