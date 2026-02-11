import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Backlog from './pages/Backlog';
import Settings from './pages/Settings';
import { ProjectProvider } from './context/ProjectContext';

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="board" element={<Board />} />
            <Route path="backlog" element={<Backlog />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProjectProvider>
  );
};

export default App;