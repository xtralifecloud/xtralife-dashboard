import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useAppContext } from "../context/app-context";

const RefreshButton = ({ setRefresh }) => {
  const [minutes, setMinutes] = useState(50);
  const { game, domain } = useAppContext();

  useEffect(() => {
    let interval = null;

    interval = setInterval(() => {
      setMinutes((minutes) => minutes + 1);
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [minutes]);

  useEffect(() => {
      setMinutes(0)
  }, [game, domain])

  const handleRefresh = () => {
    setMinutes(0);
    setRefresh((refresh) => refresh + 1);
  };

  const renderTime = () => {
    if (minutes <= 59) return <p className="m-0"> (last refresh {minutes} min ago) </p>;
    else {
        const hours = Math.floor(minutes/60)
        const remainderMins = minutes % 60
        return <p className="m-0"> (last refresh {hours} h {remainderMins} min ago) </p>;
    }
  };

  return (
    <div className="d-flex align-items-center">
      <Button variant="warning" onClick={() => handleRefresh()} className="mr-2">
        Refresh
      </Button>
      {renderTime()}
    </div>
  );
};

export default RefreshButton;
