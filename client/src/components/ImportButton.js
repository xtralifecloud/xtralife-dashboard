import React, { useState, useRef } from "react";
import { Button } from "react-bootstrap";
import { checkFileName } from "../utils/importJson";

const ImportButton = () => {
  const [file, setFile] = useState("");
  const inputFile = useRef(null);

  const handleFileUpload = (e) => {
    const { files } = e.target;
    if (files && files.length) {
      setFile(files[0]);
      checkFileName(files[0].name, "gamekv", "private");
    }
    return file
  };

  const onButtonClick = () => {
    inputFile.current.click();
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
    </div>
  );
};

export default ImportButton;
