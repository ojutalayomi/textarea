import React from 'react';
import ChatPage from './ChatPage';
import RootPage from './RootPage';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<RootPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
