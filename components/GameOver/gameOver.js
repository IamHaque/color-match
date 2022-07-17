import Leaderboard from "../Leaderboard/leaderboard";

import styles from "./gameOver.module.scss";

export default function GameOver({
  data,
  score,
  isBusy,
  currentUser,
  minDataLength,
  homepageClickHandler,
  minLeaderboardUsers,
  startGameClickHandler,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1>Game Over</h1>

        <h2>
          Score: <span>{score}</span>
        </h2>

        <button className={styles.button} onClick={startGameClickHandler}>
          {isBusy ? "..." : "Play Again"}
        </button>

        <button className={styles.button} onClick={homepageClickHandler}>
          {isBusy ? "..." : "Go to Home Screen"}
        </button>
      </div>

      {data && data.length > 0 && (
        <div className={styles.bottom}>
          <Leaderboard
            data={data}
            currentUser={currentUser}
            minDataLength={minDataLength}
            minLeaderboardUsers={minLeaderboardUsers}
          />
        </div>
      )}
    </div>
  );
}
