import { useEffect } from "react";

import Head from "next/head";

import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const setWindowHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight - 0.4}px`
      );
    };

    setWindowHeight();

    window.addEventListener("resize", setWindowHeight);
    return () => window.removeEventListener("resize", setWindowHeight);
  }, []);

  return (
    <>
      <Head>
        <title>Jumpy Dino</title>
        <meta
          name="description"
          content="Match the bar color with the ball color."
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee+Inline&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
