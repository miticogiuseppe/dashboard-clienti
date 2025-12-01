import React from "react";

const REACT_LOGO_PATH = "/bouncing-circles.svg";

export default (props) => {
  const { show } = props;

  return (
    <div
      className={`preloader bg-soft flex-column justify-content-center align-items-center ${
        show ? "" : "show"
      }`}
    >
      <img
        className="loader-element animate__animated animate__jackInTheBox"
        src={REACT_LOGO_PATH}
        height={80}
        alt="React Logo" // È buona pratica aggiungere sempre l'alt
      />
    </div>
  );
};
