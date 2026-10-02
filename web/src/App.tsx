import { useState, useEffect } from 'react';

type Page = 'connection' | 'tools' | 'logs' | 'rate-limits' | 'tokens';

function App() {
  const [page, setPage] = useState<Page>('connection');

  return (
    <>
      <aside>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <strong>woo-connector</strong>
        </div>
        <nav>
          <a href="#" className={page === 'connection' ? 'active' : ''} onClick={() => setPage('connection')}>Connection</a>
          <a href="#" className={page === 'tools' ? 'active' : ''} onClick={() => setPage('tools')}>Tool Explorer</a>
          <a href="#" className={page === 'logs' ? 'active' : ''} onClick={() => setPage('logs')}>Request Log</a>
          <a href="#" className={page === 'rate-limits' ? 'active' : ''} onClick={() => setPage('rate-limits')}>Rate Limiting</a>
          <a href="#" className={page === 'tokens' ? 'active' : ''} onClick={() => setPage('tokens')}>Access Tokens</a>
        </nav>
      </aside>
      <main>
        {page === 'connection' && <ConnectionPage />}
        {page === 'tools' && <ToolsPage />}
        {page === 'logs' && <LogsPage />}
        {page === 'rate-limits' && <RateLimitsPage />}
        {page === 'tokens' && <TokensPage />}
      </main>
    </>
  );
}

function ConnectionPage() {
  return (
    <div>
      <h1>Connection</h1>
      <div className="card">
        <div className="form-group">
          <label>URL</label>
          <input type="text" value="https://example.com" readOnly />
        </div>
        <div className="form-group">
          <label>Consumer Key</label>
          <input type="text" value="ck_xxxxxxx5821" readOnly />
        </div>
        <div className="form-group">
          <label>Consumer Secret</label>
          <input type="password" value="cs_xxxxxxx9842" readOnly />
        </div>
        <button className="primary">Test Connection</button>
      </div>
    </div>
  );
}

function ToolsPage() {
  return (
    <div>
      <h1>Tool Explorer</h1>
      <div className="card">
        <p>Select a tool to run with JSON input.</p>
        <div className="form-group">
          <select style={{ width: '100%', padding: '6px', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border)' }}>
            <option>list_orders</option>
            <option>get_order</option>
          </select>
        </div>
        <button className="primary">Run</button>
      </div>
    </div>
  );
}

function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch('http://localhost:3000/api/admin/logs')
      .then(r => r.json())
      .then(setLogs)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1>Request Log</h1>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td className="mono">{l.time}</td>
                <td>{l.method}</td>
                <td className="mono">{l.path}</td>
                <td>{l.status}</td>
                <td>{l.duration}ms</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No requests recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RateLimitsPage() {
  return (
    <div>
      <h1>Rate Limiting</h1>
      <div className="card">
        <p>Bucket Capacity: 10</p>
        <p>Current Tokens: 10</p>
        <p>Circuit Breaker: CLOSED</p>
      </div>
    </div>
  );
}

function TokensPage() {
  const [token, setToken] = useState('');
  const create = () => {
    fetch('http://localhost:3000/api/admin/tokens', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name: 'Admin Token'}) })
      .then(r => r.json())
      .then(d => setToken(d.token));
  };
  return (
    <div>
      <h1>Access Tokens</h1>
      <div className="card">
        <button onClick={create} className="primary">Create Token</button>
        {token && (
          <div style={{ marginTop: 16 }}>
            <p>New token (copy now):</p>
            <input type="text" readOnly value={token} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
