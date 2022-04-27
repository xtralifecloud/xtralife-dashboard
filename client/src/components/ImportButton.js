import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { checkFileName, readFileAsJson } from "../utils/importJson";
import ConfirmationModal from "./modals/ConfirmationModal";
import { updateGameStorage, updateGameAchievements } from "./../services/status";
import { putProducts } from "../services/store";

const ImportButton = (props) => {
  const inputFile = useRef(null);
  const [gameName, setGameName] = useState();
  const [domain, setDomain] = useState();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState({});

  useEffect(() => {
    if (props) {
      setGameName(props.gameName);
      setDomain(props.expectedDomain);
    }
  }, [props]);

  const handleFileUpload = (e) => {
    const { files } = e.target;
    if (files && files.length) {
      const result = checkFileName(files[0].name, props.expectedType, props.expectedDomain);
      if (result.state === "error") {
        return;
      }
      if (result.state === "unexpectedDomain") {
        const modalProps = {
          title: "Are you sure ?",
          body: `Are you sure you want to import into ${props.expectedDomain} your configuration from ${result.domain} ?`,
          cb: props.cb,
          onHide: () => {
            setShowConfirmation(false);
            setConfirmationProps({});
          },
          action: () => checkEnv(files[0], props.cb, result.env),
        };
        setConfirmationProps(modalProps);
        setShowConfirmation(true);
      }
      if (result.state === "success") {
        checkEnv(files[0], props.cb, result.env);
      }
    }
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  const checkEnv = (file, cb, env) => {
    setShowConfirmation(false);
    setConfirmationProps({});
    if (env !== props.expectedEnv) {
      const modalProps = {
        title: "Are you sure ?",
        body: `Are you sure you want to import into ${props.expectedEnv} your configuration from ${env} ?`,
        cb: props.cb,
        onHide: () => {
          setShowConfirmation(false);
          setConfirmationProps({});
        },
        action: () => importData(file, cb),
      };
      setConfirmationProps(modalProps);
      setShowConfirmation(true);
    } else {
      importData(file, cb);
    }
  };

  const importData = async (file, cb) => {
    props.loading(true);
    setShowConfirmation(false);
    setConfirmationProps({});
    if (props.expectedType === "gamekv") {
      readFileAsJson(file, (jsonContents) => updateGameStorage(gameName, domain, jsonContents, cb));
    }
    if (props.expectedType === "achievements") {
      readFileAsJson(file, (jsonContents) => updateGameAchievements(gameName, domain, jsonContents, cb));
    }
    if (props.expectedType === "inapp") {
      readFileAsJson(file, (jsonContents) => {
        console.log("jsonContents:", jsonContents);
        putProducts(gameName, jsonContents.list, cb);
      });
    }
  };

  return (
    <div>
      <input style={{ display: "none" }} ref={inputFile} onChange={handleFileUpload} type="file" />
      <Button variant="success" onClick={onButtonClick}>
        Import
      </Button>
      <ConfirmationModal show={showConfirmation} {...confirmationProps} />
    </div>
  );
};

export default ImportButton;
