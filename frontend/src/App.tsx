import { useState, useEffect } from 'react';
import SimpleRegression from './components/SimpleRegression';
import MultipleRegression from './components/MultipleRegression';

type Tab = 'simple' | 'multiple';

function App() {
  const [tab, setTab] = useState<Tab>('simple');
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="app">
      <button className="theme-toggle" onClick={() => setDark((d) => !d)} title="Toggle theme">
        {dark ? '\u2600\ufe0f' : '\ud83c\udf19'}
      </button>

      <header className="app-header">
        <h1>Linear Regression</h1>
        <p>Train models and make predictions</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab-btn ${tab === 'simple' ? 'active' : ''}`}
          onClick={() => setTab('simple')}
        >
          Simple
        </button>
        <button
          className={`tab-btn ${tab === 'multiple' ? 'active' : ''}`}
          onClick={() => setTab('multiple')}
        >
          Multiple
        </button>
      </nav>

      {tab === 'simple' ? <SimpleRegression /> : <MultipleRegression />}
    </div>
  );
}

export default App;
