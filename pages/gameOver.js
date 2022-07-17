import Link from "next/link";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";

import styles from "../styles/gameOver.module.scss";

export default function GameOver() {
  const [score, setScore] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.score !== undefined) {
      setScore(router.query.score);
    }
  }, [router.isReady, router.query]);

  return (
    <div className={styles.container}>
      <h1>Game Over</h1>
      <h2>Score: {score}</h2>
      <Link href="/game">Play Again</Link>
    </div>
  );
}
