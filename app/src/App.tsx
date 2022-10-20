import React from 'react';
import './App.css';
import { SendSOLToRandomAddress } from './components/SendSOLToRandomAddress';
import { Wallet } from './components/Wallet';

function App() {
  return (
    <div className="App">
      <div className='App-header'>
        <Wallet>
          <SendSOLToRandomAddress />
        </Wallet>
      </div>
    </div>
  );
}

export default App;
