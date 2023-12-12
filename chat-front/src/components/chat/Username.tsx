import React, { useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  setUsername: (username: string) => void;
}

const useUsernameInput = (initialValue = "") => {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback((e) => setValue(e.target.value), []);
  return { value, onChange };
};

const useLanguageSelection = (initialLang = "francais") => {
  const [lang, setLang] = useState(initialLang);
  const handleLangChange = useCallback((e) => setLang(e.target.value), []);
  return { lang, handleLangChange };
};

const Username = ({ socket, setUsername }: Props) => {
  const { value: text, onChange: handleTextChange } = useUsernameInput();
  const { lang, handleLangChange } = useLanguageSelection();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text !== "") {
      setUsername(text);
      socket.emit("username-set", { username: text });
      sessionStorage.setItem("lang", lang);
    } else {
      window.alert("Saisissez un username et choisissez votre langue");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          placeholder="username"
          className="input input-bordered input-primary w-full max-w-xs"
          onChange={handleTextChange}
        />
        <select
          value={lang}
          onChange={handleLangChange}
          className="select select-bordered select-primary w-full max-w-xs mt-5"
        >
        <option value="francais">Français</option>
        <option value="english">English</option>
        </select>
       
        <div className="flex items-center justify-center m-5">
          <button className="btn btn-outline btn-primary flex items-center">Let's chat</button>
        </div>
      </form>
    </div>
  );
};

export default Username;
