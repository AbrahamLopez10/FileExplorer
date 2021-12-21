import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/index.module.css";
import { useState } from "react";
import { useMountEffect } from "../lib/helpers";
import { PathsResponse } from "./api/paths";
import PathExplorer from "./components/path-explorer";

const Home: NextPage = () => {
  let [sourcePaths, setSourcePaths] = useState<string[]>();

  useMountEffect(() => {
    void loadPathsAsync();
  });

  async function loadPathsAsync() {
    let response = await fetch("/api/paths", {
      method: "GET",
    });

    let responseBody = (await response.json()) as PathsResponse;
    console.debug("Source path(s):", responseBody.paths);

    setSourcePaths(responseBody.paths);
  }

  return (
    <>
      <Head>
        <title>File Explorer</title>
      </Head>

      <main className={styles.main}>
        <p className={styles.loading} hidden={sourcePaths !== undefined}>
          Loading...
        </p>

        <p className={styles.heading} hidden={sourcePaths === undefined || sourcePaths.length > 0}>
          No paths were provided for exploring.
        </p>

        {sourcePaths?.map(path => (
          <PathExplorer key={path} path={path} />
        ))}
      </main>

      <footer className={styles.footer}>
        Built by{" "}
        <a href="https://www.linkedin.com/in/ablopezr/" target="_blank" rel="noopener noreferrer">
          Abraham Lopez
        </a>{" "}
        (<a href="mailto:ablopez824@gmail.com">ablopez824@gmail.com</a>)
      </footer>
    </>
  );
};

export default Home;
