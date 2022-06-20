import React, {useState} from "react";
import JSONEditorModal from "./JSONEditorModal";
import {useAppContext} from "../../context/app-context";
import {sendMessage} from "../../services/user";

const MessageModal = (props) => {
  const { game, domain } = useAppContext();

  const [message, setMessage] = useState({
    "event": {
      "key": "value",
      "key2": "value2",
    },
    "osn": {
      "en": {
          "title": "Example push title !",
          "body": "Example push body",
        },
      "data": {}
    }
  });

  const send = async (message) => {
    message.type = "backoffice";
    for (const user_id of props.user_ids) {
      await sendMessage(game.name, domain, user_id, message);
    }
  }

  return (
    <JSONEditorModal
      show={props.show}
      setShow={props.setShow}
      title={`Send message on domain: ${domain}`}
      value={message}
      setValue={setMessage}
      customSaveString="Send"
      onSave={send}
    />
  );
};

export default MessageModal;
