import Link from "next/link";
import { useRouter } from "next/router";

import { useState, useEffect } from "react";

import Leaderboard from "../components/leaderboard";

import styles from "../styles/gameOver.module.scss";

export default function GameOver({ leaderboardData }) {
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    let localUsername = JSON.parse(localStorage.getItem("jumpyDinoUsername"));

    if (localUsername) {
      setCurrentUser(localUsername);
    }
  }, []);

  useEffect(() => {
    let localLastScore = JSON.parse(localStorage.getItem("jumpyDinoLastScore"));

    if (localLastScore && score !== localLastScore) {
      setScore(localLastScore);
    }
  }, [score]);

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.score !== undefined) {
      setScore(router.query.score);
    }
  }, [router.isReady, router.query]);

  const startGame = () => {
    if (isBusy) return;

    setIsBusy(true);
    router.replace({
      pathname: "/game",
      query: { username: currentUser },
    });
    setIsBusy(false);
  };

  const goToHome = () => {
    if (isBusy) return;

    setIsBusy(true);
    router.replace("/");
    setIsBusy(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1>Game Over</h1>

        <h2>
          Score: <span>{score}</span>
        </h2>

        <button className={styles.button} onClick={startGame}>
          {isBusy ? "..." : "Play Again"}
        </button>

        <button className={styles.button} onClick={goToHome}>
          {isBusy ? "..." : "Go to Home Screen"}
        </button>
      </div>

      {leaderboardData.length > 0 && (
        <div className={styles.bottom}>
          <Leaderboard
            minDataLength={-1}
            data={leaderboardData}
            minLeaderboardUsers={5}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  const dev = process.env.NODE_ENV !== "production";
  const hostname = dev
    ? "http://localhost:3000"
    : "https://jumpy-dino-guy.herokuapp.com";

  const requestOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  const response = await fetch(hostname + "/api/leaderboard", requestOptions);
  const data = await response.json();

  let leaderboardData = [];
  if (data && data.status && data.status === "success") {
    leaderboardData = [...data.leaderboard];
  }

  return {
    props: { leaderboardData }, // will be passed to the page component as props
  };
}
