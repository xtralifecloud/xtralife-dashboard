import React, { useState, useRef } from "react";
import { CloudUpload } from "react-bootstrap-icons";
import ConfirmationModal from "./modals/ConfirmationModal";
import { updateGameStorage, getSignedUrl } from "./../services/status";
import { updateUserStorage, getSignedUrlGamer } from "./../services/user";
import { toast } from "react-toastify";
import { useAppContext } from "../context/app-context";

const LoadDisplay = (props) => {
  const { loaded } = useAppContext();
  return (
    <div className="d-flex justify-content-between align-items-center h-100">
      <p className="m-0">Uploading to AWS: {loaded}%</p>
      <button
        className="remove-btn-css"
        style={{
          border: "1px solid #FC4F4F",
          color: "#FC4F4F ",
          padding: "0px 10px",
          fontSize: "14px",
          borderRadius: "12px",
        }}
        onClick={() => {
          props.xhr.abort();
          toast.dismiss(props.toastId.current);
        }}
      >
        abort
      </button>
    </div>
  );
};

const UploadBinaryButton = (props) => {
  const inputFile = useRef(null);
  const { setLoaded } = useAppContext();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState({});
  const toastId = useRef(null);

  const uploadToAWS = async (file) => {
    setShowConfirmation(false);
    setConfirmationProps({});

    let urls = [];

    if (props.user_id) {
      console.log('props.user_id:', props.user_id)
      urls = await getSignedUrlGamer(props.gameName, props.user_id, props.domain, props.fsKey);
    } else {
      urls = await getSignedUrl(props.gameName, props.domain, props.fsKey);
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", urls.signedURL, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = e.loaded / e.total;
          setLoaded(parseInt(progress * 100));
          return toast.update(toastId.current, {
            progress: progress,
          });
        }
      };
      xhr.onloadend = () => {
        if(xhr.status === 200) return finalizeUpload(urls.getURL);
      };
      xhr.onloadstart = () => {
        setLoaded(0);
        return (toastId.current = toast(<LoadDisplay xhr={xhr} toastId={toastId} />, {
          progress: 0,
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        }));
      };
      xhr.onerror = (err) => {
        console.log(err);
        toast.dismiss(toastId.current);
        return toast.error(`Upload error : ${JSON.stringify(err)}`);
      };
      return xhr.send(arrayBuffer);
    };
    return reader.readAsArrayBuffer(file);
  };

  const finalizeUpload = (getUrl) => {
    setLoaded(100);
    toast.dismiss(toastId.current);
    const updatedStorage = props.storage;
    updatedStorage[props.selectedKV].fsvalue = JSON.stringify(getUrl);
    if (props.user_id) {
      return updateUserStorage(
        props.gameName,
        props.domain,
        props.user_id,
        updatedStorage,
        props.cb
      );
    } else {
      return updateGameStorage(
        props.gameName,
        props.domain,
        updatedStorage,
        props.cb
      );
    }
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  return (
    <div>
      <input
        style={{ display: "none" }}
        ref={inputFile}
        onChange={(e) => {
          const { files } = e.target;
          const file = files[0];
          if (!file) return toast.error("Cannot read file");
          const modalProps = {
            title: "Are you sure ?",
            body: `Are you sure you want to upload ${file.name} (${formatBytes(
              file.size
            )}) to AWS ?`,
            onHide: () => {
              setShowConfirmation(false);
              setConfirmationProps({});
            },
            action: () => uploadToAWS(file),
          };
          setConfirmationProps(modalProps);
          setShowConfirmation(true);
        }}
        type="file"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onButtonClick();
        }}
        className="remove-btn-css mr-2 d-flex flex-row algin-items-center"
        style={{
          border: "1px solid #4c9be8",
          color: "#4c9be8",
          padding: "1px 7px 2px 7px",
          fontSize: "14px",
          borderRadius: "12px",
        }}
      >
        <p style={{ margin: "2px 4px 0px 0px" }}>AWS</p>
        <CloudUpload size={20} className="mt-1" />
      </button>
      <ConfirmationModal show={showConfirmation} {...confirmationProps} />
    </div>
  );
};

export default UploadBinaryButton;
