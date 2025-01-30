import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import JoinView from './JoinView';
import ViewWrapper from './ViewWrapper';
import WizardView from './WizardView';

const App = () => {
  return (
    <BrowserRouter basename="">
      <Routes>
        <Route path="/" element={<ViewWrapper> <JoinView /></ViewWrapper>} />
        <Route path="/wizard" element={<ViewWrapper> <WizardView /></ViewWrapper>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
