
import Link from 'next/link'
import { useState } from 'react';

export default function Home() {
  // const [sessionPin, setSessionPin] = useState('');
  const [treeId, setTreeId] = useState('');

  return (
    <div className="intro-container">
      {/*
      <label>
        Join Room (Session pin)
        <input
          value={sessionPin}
          onChange={(e) => setSessionPin(e.target.value)}
        />
      </label>
      */}
      <br />
      <label>
        Tree ID
        <input
          value={treeId}
          onChange={(e) => setTreeId(e.target.value)}
        />
      </label>
      <Link href={`/${treeId}`}>Load</Link>
    </div>
  );
}
