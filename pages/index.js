import Link from "next/link";

import styles from "../styles/home.module.scss";

export default function Home() {
  return (
    <div className={styles.container}>
      <Link href="/game">Start Game</Link>
    </div>
  );
}
