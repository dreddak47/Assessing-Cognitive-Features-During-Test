import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Test from './Test/Testq';
import Success from './Success/Success';
import Index from './index/index';
import InstructionsPage from './instructions/instruction';
import AdminPage from './admin/admin';

function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/instruction" element={<InstructionsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* <Route path="/" element={<Register />} /> */}
        <Route path="/test" element={<Test />} />
        <Route path="/success" element={<Success />} />
        
        {/* <Route path="/" element={<Test />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
