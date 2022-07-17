import Image from "next/image";
import { useRouter } from "next/router";

import { useState, useEffect } from "react";

import FG_IMG from "/public/home_fg.png";

import styles from "../styles/home.module.scss";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [response, setResponse] = useState(undefined);

  useEffect(() => {
    let localUsername = JSON.parse(localStorage.getItem("jumpyDinoUsername"));
    if (localUsername) {
      setUserExists(true);
      setUsername(localUsername);
    }
  }, []);

  const registerUser = async () => {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch("/api/createUser", requestOptions);
    const data = await response.json();

    setResponse(data);

    if (data.status && data.status === "success") {
      localStorage.setItem("jumpyDinoUsername", JSON.stringify(username));
      setUserExists(true);
    }
  };

  const usernameChangeHandler = () => {
    setUsername("");
    setUserExists(false);
    setResponse(undefined);
    localStorage.setItem("jumpyDinoUsername", JSON.stringify(""));
    localStorage.setItem("jumpyDinoHighScore", JSON.stringify(0));
  };

  const startGame = () => {
    router.push({
      pathname: "/game",
      query: { username },
    });
  };

  const handleInput = (e) => {
    setUsername(e.target.value.trim());
  };

  const handleSubmit = async (e) => {
    await registerUser();
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <div className={styles.top}>
          <h1>Jumpy Dino</h1>
          <p>
            Welcome <span>{username}</span>!
            <br />
            Match the next Tree's color with the Dino's color.
            <br />
            Press SPACE, CLICK or TOUCH to change Tree color.
          </p>

          {userExists && (
            <button className={styles.button} onClick={startGame}>
              Start Game
            </button>
          )}

          {!userExists && (
            <div className={styles.formWrapper}>
              <div className={styles.form}>
                <input
                  type="text"
                  value={username}
                  onChange={handleInput}
                  className={styles.input}
                  placeholder="Enter username"
                />
                <input
                  type="button"
                  value="Submit"
                  onClick={handleSubmit}
                  className={styles.submitButton}
                />
              </div>

              {response && response.status && response.status === "failed" && (
                <small
                  dangerouslySetInnerHTML={{ __html: response.message }}
                ></small>
              )}
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <Image
            src={FG_IMG}
            width="689px"
            height="468px"
            alt="Foreground"
            className={styles.foreground}
          />
        </div>
      </div>
    </div>
  );
}
