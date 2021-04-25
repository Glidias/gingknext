
import Head from 'next/head';
import Link from 'next/link'
import { useState } from 'react';

export default function Home() {
  // const [sessionPin, setSessionPin] = useState('');
  const [treeId, setTreeId] = useState('');

  return (
    <div className="intro-container">
      <style jsx>{`
        .intro-container {
          padding: 10px;
          width:100%;
          box-sizing:border-box;
        }
        .codebox {
          word-break: break-all;
          word-wrap: break-word;
          width:100%;
          font-size:0.7em;
        }

      `}</style>
      <Head>
        <link rel="stylesheet" href="/home.css"/>
      </Head>
      {/*
      <label>
        Join Room (Session pin)
        <input
          value={sessionPin}
          onChange={(e) => setSessionPin(e.target.value)}
        />
      </label>
      */}
      <h1>
        <img src="/gingko-leaf-logo.svg" width={28} />
        GingkNext
      </h1>
      An alternative <a href="https://gingkoapp.com" target="_blank">Gingko</a> Doc Viewer

      <hr></hr>
      <div><pre className="codebox">{treeId.charAt(0) !== '-' ? 'https://gingkoapp.com/' : '/'}{treeId || '{Tree ID}'}</pre></div>
      <label>
        Tree ID&nbsp;
        <input
          value={treeId}
          onChange={(e) => setTreeId(e.target.value)}
        />
      </label>&nbsp;
      { treeId ?
        <Link href={`/${treeId}`}>Load</Link>
        : undefined
      }
      <hr></hr>
      <hr></hr>
      <hr></hr>
      <a href="https://github.com/Glidias/gingknext" target="_blank">Github Link</a>
    </div>
  );
}
