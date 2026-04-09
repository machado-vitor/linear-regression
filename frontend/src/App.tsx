import { useState } from 'react';
import SimpleRegression from './components/SimpleRegression';
import MultipleRegression from './components/MultipleRegression';

type Tab = 'simple' | 'multiple';

function App() {
  const [tab, setTab] = useState<Tab>('simple');

  return (
    <div className="app">
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
