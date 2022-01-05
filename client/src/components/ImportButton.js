import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { checkFileName, readFileAsJson } from "../utils/importJson";
import ConfirmationModal from "./modals/ConfirmationModal";
import { updateGameStorage } from "./../services/status";

const ImportButton = (props) => {
  const inputFile = useRef(null);
  const [gameName, setGameName] = useState()
  const [domain, setDomain] = useState()
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState({});

  useEffect(() => {
    if(props){
      setGameName(props.gameName)
      setDomain(props.expectedDomain)
    }
  }, [props])

  const handleFileUpload = (e) => {
    const { files } = e.target;
    if (files && files.length) {
      const result = checkFileName(
        files[0].name,
        props.expectedType,
        props.expectedDomain
      );
      if (result.state === "error") {
        return;
      }
      if (result.state === "unexpectedDomain") {
        <ConfirmationModal
          body={`Are you sure you want to import into ${result.domain} your configuration from ${result.expectedDomain} ?`}
        />;
      }
      if (result.state === "unexpectedDomain") {
        props = {
          title: "Unexpected Domain",
          body: `Are you sure you want to import into ${props.expectedDomain} your configuration from ${result.domain} ?`,
          onHide: () => {
            setShowConfirmation(false);
            setConfirmationProps({});
          },
          action: () => importData(files[0]),
        };
        setConfirmationProps(props);
        setShowConfirmation(true);
      }
      if (result.state === "success") {
        importData(files[0]);
      }
    }
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  const importData = (file) => {
    setShowConfirmation(false);
    setConfirmationProps({});
    readFileAsJson(file, jsonContents => updateGameStorage(gameName, domain, jsonContents))
  };

  return (
    <div>
      <input
        style={{ display: "none" }}
        // accept=".zip,.rar"
        ref={inputFile}
        onChange={handleFileUpload}
        type="file"
      />
      <Button variant="outline-success" onClick={onButtonClick}>
        Import
      </Button>
      <ConfirmationModal show={showConfirmation} {...confirmationProps} />
    </div>
  );
};

export default ImportButton;
