import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './App.css';
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.bundle"
import { GetNFT } from './components/GetNFT';
import { GetHistory } from './components/GetHistory';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Faucet from "./components/Faucet"
import PlayGame from './components/Playgame';
import Header from './components/Header';
import { Provider } from 'react-redux';
import { store } from './reduxs/store';
function App() {
  return (
    <>
      <Provider store={store}>
        <div className='bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300 h-full' style={{ width: "100%" }}>
          <BrowserRouter>
            <Header />
            <div className='h-full'>
              <Routes>
                <Route path='/get-NFT' element={<GetNFT />}></Route>
                <Route path='/get-history' element={<GetHistory />}></Route>
                <Route path='/' element={<PlayGame />} />
                <Route path='/Faucet' element={<Faucet />}></Route>
              </Routes>
            </div>
          </BrowserRouter >
        </div>
      </Provider>
    </>
  );
}

export default App;