import React, { useState } from 'react';
import Login from './pages/Login';
import MoniteursList from './pages/MoniteursList';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  const [menu, setMenu] = useState('moniteurs');

  const handleLogin = () => setIsAuth(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      {isAuth ? (
        <>
          <Sidebar onMenuClick={setMenu} onLogout={handleLogout} selected={menu} />
          <main
            style={{
              flex: 1,
              padding: 32,
              minHeight: '100vh',
              background: '#fafafa',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {menu === 'moniteurs' && <MoniteursList />}
            {menu === 'dashboard' && <AdminDashboard />}
            {/* Tu pourras ajouter d'autres menus ici */}
          </main>
        </>
      ) : (
        <div style={{ flex: 1 }}>
          <Login onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
}

export default App;
