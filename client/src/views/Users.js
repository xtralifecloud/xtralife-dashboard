import React, { useState, useEffect, useRef } from "react";
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
import {
  deleteUser,
  getUsers,
  searchUsers,
  findUser,
  getUsersCount,
  searchUsersCount,
} from "../services/user";
import { isPresent } from "../utils/isPresent";
import Paginate from "../components/Paginate";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const { game, page, setPage, itemsNumber, setItemsNumber } = useAppContext();
  const [users, setUsers] = useState({ list: [] });
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState(null);
  const tableRef = useRef();
  const paginateRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const skip = (page - 1) * itemsNumber;
    if (game.name && !search) {
      (async (skip, limit) => {
        if (tableRef.current) tableRef.current.classList.add("grayout");
        const users = await getUsers(game.name, skip, limit);
        if (users) setUsers(users);
        if (tableRef.current) tableRef.current.classList.remove("grayout");
        setLoading(false);
      })(skip, itemsNumber);
      (async () => {
        const count = await getUsersCount(game.name);
        if (count) setCount(count.total);
        setLoading(false);
      })();
    }
  }, [game, itemsNumber, page, tableRef, search]);

  useEffect(() => {
    if (game.name && search) {
      (async () => {
        const skip = (page - 1) * itemsNumber;
        const users = await searchUsers(game.name, skip, itemsNumber, search);
        setUsers(users);
        const count = await searchUsersCount(game.name, search);
        setCount(count.total);
        setLoading(false);
      })();
    }
    /* eslint-disable */
  }, [itemsNumber, page]);


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

  const bulkMessageUser = () => {
    /* for (const user_id of selectedUsers) {
      sendMessage(game.name, user_id);
    } */
  };
  const handleSearch = async () => {
    setLoading(true);
    if (search === null || search === "") {
      const skip = (page - 1) * itemsNumber;
      const users = await getUsers(game.name, skip, itemsNumber);
      setUsers(users);
      setLoading(false);
    } else if (/^[0-9a-fA-F]{24}$/.test(search)) {
      const user = await findUser(game.name, search);
      setUsers(user);
      setLoading(false);
    } else {
      const skip = (page - 1) * itemsNumber;
      setCount(0);
      const users = await searchUsers(game.name, skip, itemsNumber, search);
      setUsers(users);
      setLoading(false);
      if (paginateRef.current) paginateRef.current.classList.add("grayout");
      const count = await searchUsersCount(game.name, search);
      setCount(count.total);
      if (paginateRef.current) paginateRef.current.classList.remove("grayout");
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
            <Trash size={20} className="mr-2" /> Delete {selectedUsers.length}{" "}
            {selectedUsers.length === 1 ? "user" : "users"}
          </Button>
          <Button
            variant="secondary"
            disabled={buttonDisabled}
            className="d-flex align-items-center"
            onClick={() => bulkMessageUser()}
          >
            <Chat size={20} className="mr-2" /> Message {selectedUsers.length}{" "}
            {selectedUsers.length === 1 ? "user" : "users"}
          </Button>
        </ButtonGroup>
        <div className="d-flex">
          <Form.Control
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => handleSearch()}
            className="d-flex align-items-center"
          >
            <Search size={15} />
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner animation="border" variant="outline-primary" />
      ) : isPresent([users]) && users.total === 0 ? (
        search ? (
          <p>No users found with username "{search}"</p>
        ) : (
          <p>You don't have any user yet</p>
        )
      ) : (
        <div>
          <Table ref={tableRef} size="sm" bordered hover borderless responsive>
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
                    <td
                      key={`id-${user._id}`}
                      className="d-flex justify-content-between"
                    >
                      {user._id}
                      <button
                        onClick={() => navigate(`/gamer/${user._id}`)}
                        className="remove-btn-css mr-2 d-flex algin-items-center"
                      >
                        <PencilSquare size={20} />
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
          <div ref={paginateRef}>
            <Paginate
              page={page}
              setPage={setPage}
              itemsNumber={itemsNumber}
              setItemsNumber={setItemsNumber}
              totalItems={count}
            />
          </div>
        </div>
      )}
    </Container>
  );
};

export default Users;
