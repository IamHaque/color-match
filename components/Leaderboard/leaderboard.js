import styles from "./leaderboard.module.scss";

export default function Leaderboard({
  data,
  currentUser,
  minDataLength,
  minLeaderboardUsers,
}) {
  if (!data || data.length <= minDataLength) return;

  let emptyLeaderboardRows;
  if (data.length < minLeaderboardUsers) {
    emptyLeaderboardRows = new Array(minLeaderboardUsers - data.length)
      .fill(0)
      .map((_, index) => (
        <p className={styles.row} key={index + "randomSalt01"}>
          <span>-</span>
          <span>-</span>
          <span>-</span>
        </p>
      ));
  }

  return (
    <>
      <p className={styles.titleText}>Leader Board</p>

      <section className={styles.leaderboardContainer}>
        {data.map((user, index) => (
          <p
            className={`${styles.row} ${
              user.username === currentUser ? styles.active : ""
            }`}
            key={index}
          >
            <span>{user.rank}.</span>
            <span>{user.username}</span>
            <span>{user.highscore}</span>
          </p>
        ))}

        {emptyLeaderboardRows}
      </section>
    </>
  );
}
