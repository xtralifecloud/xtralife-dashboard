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
import logoFacebook from "../assets/facebook.png";
import logoGoogle from "../assets/google.png";
import logoSteam from "../assets/steam.png";
import logoFirebase from "../assets/firebase.png";
import incognito from "../assets/incognito.png";
import { People, Trash, Chat, Search, Envelope } from "react-bootstrap-icons";
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
  const [searchType, setSearchType] = useState("userId");
  const [search, setSearch] = useState(null);
  const tableRef = useRef();
  const paginateRef = useRef();
  const [refresh, setRefresh] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const skip = (page - 1) * itemsNumber;
    if (game.name && !search) {
      (async (skip, limit) => {
        if (tableRef.current) tableRef.current.classList.add("grayout");
        const users = await getUsers(game.name, skip, limit);
        if (!isCancelled) {
          if (users) setUsers(users);
          if (tableRef.current) tableRef.current.classList.remove("grayout");
          setLoading(false);
        }
      })(skip, itemsNumber);
      (async () => {
        const count = await getUsersCount(game.name);
        if (!isCancelled) {
          if (count) setCount(count.total);
          setLoading(false);
        }
      })();
    }

    return () => {
      isCancelled = true;
    };
  }, [game, itemsNumber, page, tableRef, search, refresh]);

  useEffect(() => {
    let isCancelled = false;

    if (game.name && search) {
      (async () => {
        const skip = (page - 1) * itemsNumber;
        const users = await searchUsers(game.name, skip, itemsNumber, search);
        if (!isCancelled) {
          setUsers(users);
        }
        const count = await searchUsersCount(game.name, search);
        if (!isCancelled) {
          setCount(count.total);
          setLoading(false);
        }
      })();
    }
    return () => {
      isCancelled = true;
    };
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

  const bulkDeleteUser = async () => {
    for (const user_id of selectedUsers) {
       await deleteUser(game.name, user_id);
    }
    setSelectedUsers([]);
    setRefresh(refresh => refresh + 1);
  };

  const bulkMessageUser = () => {
    /* for (const user_id of selectedUsers) {
      sendMessage(game.name, user_id);
    } */
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (search === null || search === "") {
      const skip = (page - 1) * itemsNumber;
      const users = await getUsers(game.name, skip, itemsNumber);
      setUsers(users);
      setLoading(false);
    } else if (searchType === "userId") {
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

  const renderNetworkIcon = (network) => {
    switch (network) {
      case "facebook":
        return (
          <img
            src={logoFacebook}
            alt="logo Facebook"
            style={{ width: "28px" }}
          />
        );
      case "google":
        return (
          <img src={logoGoogle} alt="logo Google" style={{ width: "28px" }} />
        );
      case "firebase":
        return (
          <img
            src={logoFirebase}
            alt="logo Firebase"
            style={{ width: "32px" }}
          />
        );
      case "steam":
        return (
          <img src={logoSteam} alt="logo steam" style={{ width: "28px" }} />
        );
      case "email":
        return (
          <Envelope size={25} /> 
        );
      case "anonymous":
        return (
          <div className="white-circle">
            <img src={incognito} alt="incognito" style={{ width: "20px" }} />
          </div>
        );
      default:
        return;
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
          <Form className="d-flex align-items-center">
            <Form.Check
              inline
              label="UserId"
              type="radio"
              checked={searchType === "userId"}
              readOnly={true}
              className="mb-0"
              onClick={() => setSearchType("userId")}
            />
            <Form.Check
              inline
              label="Name/Email"
              type="radio"
              checked={searchType === "name"}
              readOnly={true}
              onClick={() => setSearchType("name")}
            />

            <Form.Control
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="secondary"
              type="submit"
              onClick={(e) => handleSearch(e)}
            >
              <Search size={15} />
            </Button>
          </Form>
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
          <p className="m-1">
            Note : click on a user's Id cell to see his data
          </p>
          <div ref={paginateRef}>
            {itemsNumber !== 10 && (
              <Paginate
                page={page}
                setPage={setPage}
                itemsNumber={itemsNumber}
                setItemsNumber={setItemsNumber}
                totalItems={count}
              />
            )}
          </div>
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
                    <td className="align-middle">
                      <div className="d-flex align-items-center justify-content-center">
                        <FormCheck.Input
                          type="checkbox"
                          className="m-0"
                          onClick={(e) => handleSelection(e, user._id)}
                        />
                      </div>
                    </td>
                    <td
                      key={`id-${user._id}`}
                      className="d-flex justify-content-between clickable"
                      onClick={() => navigate(`/gamer/${user._id}`)}
                    >
                      <div className=" w-100 d-flex justify-content-between align-items-center">
                        <p className="m-0">{user._id}</p>
                        {renderNetworkIcon(user.network)}
                      </div>
                    </td>
                    <td className="align-middle" key={`name-${user._id}`}>
                      {user.profile.displayName}
                    </td>
                    <td className="align-middle" key={`email-${user._id}`}>
                      {user.profile.email}
                    </td>
                    <td className="align-middle" key={`lang-${user._id}`}>
                      {user.profile.lang}
                    </td>
                    <td
                      className="align-middle"
                      key={`linkedto-${user._id}`}
                    ></td>
                    <td className="align-middle" key={`events-${user._id}`}>
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
