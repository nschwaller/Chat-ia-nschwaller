"use strict";
import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  username: string;
  preds: string[];
}

const Prediction = ({ socket, username, preds }: Props) => {
  const [predictions, setPredictions] = useState(["", ""]);

  useEffect(() => {
    if (preds.length >= 2) {
      setPredictions([preds[0], preds[1]]);
    }
  }, [preds]);

  const sendPrediction = (prediction: string) => {
    if (prediction) {
      socket.emit("chat-message", {
        username,
        content: prediction,
        timeSent: new Date().toISOString(),
      });
    }
  };

  return (
    <footer className="sticky bottom-0 ">
      {predictions.map((prediction, index) => (
        <button
          key={index}
          onClick={() => sendPrediction(prediction)}
          className="btn btn-wide m-3"
          disabled={!prediction}
        >
          {prediction || `Prediction ${index + 1}`}
        </button>
      ))}
    </footer>
  );
};

export default Prediction;
