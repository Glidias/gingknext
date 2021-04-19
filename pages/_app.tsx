import "../styles/globals.css";

import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <div id="app-root">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;1,400;1,700&amp;family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&amp;family=Roboto+Mono:wght@400;700&amp;display=swap" rel="stylesheet"/>
        <link rel="stylesheet" href="/style.css"/>
        <link rel="stylesheet" href="/home.css"/>
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
