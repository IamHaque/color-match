import Image from "next/image";

import FG_IMG from "/public/home_fg.png";

import styles from "./home.module.scss";

export default function HomeScreen({
  username,
  userExists,
  errorMessage,
  inputHandler,
  submitHandler,
  startGameClickHandler,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <div className={styles.top}>
          <h1>Jumpy Dino</h1>
          <p>
            {username && (
              <>
                Welcome <span>{username}</span>!
              </>
            )}
            <br />
            Match the next Tree&apos;s color with the Dino&apos;s color.
            <br />
            Press SPACE, CLICK or TOUCH to change Tree color.
          </p>

          {userExists && (
            <button className={styles.button} onClick={startGameClickHandler}>
              Start Game
            </button>
          )}

          {!userExists && (
            <div className={styles.formWrapper}>
              <div className={styles.form}>
                <input
                  type="text"
                  value={username}
                  onChange={inputHandler}
                  className={styles.input}
                  placeholder="Enter username"
                />
                <input
                  type="button"
                  value="Submit"
                  onClick={submitHandler}
                  className={styles.submitButton}
                />
              </div>

              {errorMessage && (
                <small
                  dangerouslySetInnerHTML={{ __html: errorMessage }}
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
