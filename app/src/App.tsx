import React from 'react';
import './App.css';
import { CreateTokenAccount } from './components/CreateTokenAccount';
import { EscrowTransferToken } from './components/EscrowTransferToken';
import { Wallet } from './components/Wallet';

function App() {
  return (
    <div className="App">
      <div className='App-header'>
        <Wallet>
          
          <CreateTokenAccount />
          <EscrowTransferToken />
        </Wallet>
      </div>
    </div>
  );
}

export default App;
