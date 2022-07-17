import { useEffect } from "react";

import Head from "next/head";

import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const setWindowHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight}px`
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
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
