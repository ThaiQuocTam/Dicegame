import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import '../App.css';
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.bundle"
import { contractAddress } from '../solidity/contractAddress';
import abi from '../solidity/abi.json';
import { AnimationWin } from './AnimationWin';
import { textChooseBet, textBetting, textStatus, textInstructions, textGame } from '../constants';
import imageStart from "../image/image-start.png";
import { Loading } from './Loading';
import { useSelector } from 'react-redux';
import { getNftSelector, rewardDataSelector } from '../reduxs/selector';
import { clearAllListeners } from '@reduxjs/toolkit';

function PlayGame() {

    const [balances, setBalances] = useState(0)
    const [valueReceive, setValueReceive] = useState(0)
    const [betValue, setBetValue] = useState(1000)
    const [bet, setBet] = useState("HIGH")
    const [walletAddress, setWalletAddress] = useState("");
    const [, setSigner] = useState();
    const [fcContract, setFcContract] = useState();
    const [totalDice, setTotalDice] = useState(0);
    const [checkOtherBet, setCheckOtherBet] = useState(false);
    const [validateBetOther, setValidateBetOther] = useState("");
    const [firstDieResult, setFirstDieResult] = useState(1);
    const [secondDieResult, setSecondDieResult] = useState(1);
    const [thirdDieResult, setThirdDieResult] = useState(1);
    const [intervalRandom, setIntervalRandom] = useState(0);
    const [counterDiceGame, setCounterDiceGame] = useState(1);
    const [listJsonData, setlistJsonData] = useState([]);
    const [statusGame, setStatusGame] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [collection, setCollection] = useState('collection0');
    const [isLoading, setLoading] = useState(false);
    const [chainId, setChainId] = useState('');
    const firstDieImage = require(`../assets/${collection}/${firstDieResult}.png`);
    const secondDieImage = require(`../assets/${collection}/${secondDieResult}.png`);
    const thirdDieImage = require(`../assets/${collection}/${thirdDieResult}.png`);
    const [isShowIns, setShowIns] = useState(false);
    const [active, setActive] = useState('Play');
    const NftSelector = useSelector(getNftSelector)
    const rewardData = useSelector(rewardDataSelector)

    useEffect(() => {
        if (NftSelector && Object.keys(NftSelector.getNft).length !== 0) {
            DiceChange(NftSelector.getNft)
        }
        else {
            setCollection('collection0')
        }
    }, [NftSelector])

    useEffect(() => {
        if (rewardData) {
            const newArrRewardData = []
            rewardData.rewardData.map((item) => {
                newArrRewardData.push(item)
            })
            setlistJsonData(newArrRewardData)
        }
    }, [rewardData])


    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();

    }, [walletAddress, valueReceive])

    useEffect(() => {
        setTotalDice(firstDieResult + secondDieResult + thirdDieResult);
        if (isLoading) {
            const interval = setInterval(
                () => setIntervalRandom(Math.floor(Math.random() * 6) + 1),
                100
            );
            return () => {
                clearInterval(interval);
            };
        }
    }, [firstDieResult, secondDieResult, thirdDieResult, isLoading, intervalRandom])

    useEffect(() => {
        if (checkOtherBet) {
            document.getElementById("focus").focus()
        }
    }, [checkOtherBet])

    useEffect(() => {
        const timerId = setTimeout(() => {
            setShowModal(false);
        }, 3000)
        return () => clearTimeout(timerId)
    }, [balances])

    const rollDice = async () => {
        setLoading(true)
        if (Number(balances.toString()) < betValue) {
            setLoading(false);
            updateStatus("You don't have enough money to bet")
        } else {
            var dice1 = 0
            var dice2 = 0
            var dice3 = 0
            var total = 0
            if (counterDiceGame % 3 === 0) {
                if (bet === "LOW") {
                    dice1 = 1
                    dice2 = 1
                    dice3 = 1
                    total = dice1 + dice2 + dice3
                } else {
                    dice1 = 6
                    dice2 = 6
                    dice3 = 6
                    total = dice1 + dice2 + dice3
                }
                setCounterDiceGame(counterDiceGame + 1)
            } else {
                dice1 = Math.floor(Math.random() * 6) + 1
                dice2 = Math.floor(Math.random() * 6) + 1
                dice3 = Math.floor(Math.random() * 6) + 1
                total = dice1 + dice2 + dice3
                setCounterDiceGame(counterDiceGame + 1)
            }
            let temp = await fcContract._totalNFT();
            const totalNFT = temp.toNumber();
            const listTokenIdOwners = []
            for (let i = 1; i <= totalNFT; i++) {
                let amountOwner = await fcContract.balanceOf(await fcContract.owner(), i);
                if (amountOwner.toString() !== "0") {
                    listTokenIdOwners.push(i);
                }
            }
            var idToken = listTokenIdOwners[Math.floor(Math.random() * listTokenIdOwners.length)];

            setFirstDieResult(dice1);
            setSecondDieResult(dice2);
            setThirdDieResult(dice3);
            const reward = getValueReward();
            await DiceGame(reward, bet, betValue, total, idToken);
            fcContract.on("Result", (id, bet, amount, player, resultBet, time) => {
                setStatusGame(resultBet);
                setShowModal(true);
                setValueReceive(amount);
                setLoading(false);
                updateStatus("Click to play start !")
            })
        }
    }

    const getValueReward = () => {
        let valueReward = 0;
        let rsltListData = [];
        const isExistedA = listJsonData.some((ele) => ele.trait_type === "RewardA");
        const isExistedB = listJsonData.some((ele) => ele.trait_type === "RewardB");
        const isExistedC = listJsonData.some((ele) => ele.trait_type === "RewardC");
        if (listJsonData.length > 1) {
            if ((isExistedA && isExistedB && !isExistedC) || (isExistedA && !isExistedB && isExistedC) || (!isExistedA && isExistedB && isExistedC)) {
                // RewardA, RewardB || RewardA, RewardC || RewardB, RewardC
                valueReward = listJsonData[listJsonData.length - 1].value;
                return valueReward;
            } else {
                //RewardA && RewardB && RewardC
                rsltListData = listJsonData.sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0));
                valueReward = rsltListData[rsltListData.length - 1].value;
                return valueReward;
            }
        } else if (listJsonData.length === 1) {
            // RewardA || RewardB || RewardC
            valueReward = listJsonData[0].value;
            return valueReward;
        } else {
            return valueReward;
        }
    }

    function updateStatus(status) {
        if (status === 'Waiting to confirm the transaction' || status === 'confirmed, wait moment') {
            setLoading(true)
        }
        else {
            setLoading(false)
        }
        const statusEl = document.getElementById("status");
        statusEl.innerHTML = status;
    }

    const DiceGame = async (reward, bet, betValue, total, tokenId) => {
        updateStatus('Waiting to confirm the transaction')
        try {
            await fcContract.game(reward, bet, betValue, total, tokenId);
            updateStatus('confirmed, wait moment')
        } catch (error) {
            updateStatus('Error')
        }
    }

    const connectWallet = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
                // check if the chain to connect to is installed
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x5' }],
                });
            } catch (err) {
                console.error(err.message);
            }
            try {
                //   / get provider /
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                //   / get accounts /
                const accounts = await provider.send("eth_requestAccounts", []);
                //   / get signer /
                const tempSigner = provider.getSigner()
                setSigner(tempSigner);
                //   / get network /
                const network = await provider.getNetwork();
                setChainId('0x' + network.chainId.toString());
                //   / local contract instance /
                const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
                setFcContract(tempContract)
                //   / set active wallet address /
                setWalletAddress(accounts[0]);
                await tempContract.balanceOf(accounts[0], 0)
                    .then((balance) => { setBalances(balance) })
            } catch (err) {
                console.error(err.message);
            }
        } else {
            // / MetaMask is not installed /
            console.log("Please install MetaMask");
        }
    }

    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
                // / get provider /
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                // / get accounts /
                const accounts = await provider.send("eth_accounts", []);
                if (accounts.length > 0) {
                    // / get signer /
                    const tempSigner = provider.getSigner()
                    setSigner(tempSigner);
                    // / get network /
                    const network = await provider.getNetwork();
                    setChainId('0x' + network.chainId.toString());
                    // / local contract instance /
                    const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
                    setFcContract(tempContract)
                    setWalletAddress(accounts[0]);
                    await tempContract.balanceOf(accounts[0], 0).then((balance) => setBalances(balance));
                } else {
                    setBalances(0);
                    console.log("Connect to MetaMask using the Connect Wallet button");
                }
            } catch (err) {
                console.error(err.message);
            }
        } else {
            // / MetaMask is not installed /
            console.log("Please install MetaMask");
        }
    };

    const addWalletListener = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            window.ethereum.on("accountsChanged", (accounts) => {
                setWalletAddress(accounts[0]);
            });
            window.ethereum.on("chainChanged", (chainId) => {
                setChainId(chainId.toString());
                if (chainId.toString() === '0x5') {
                    getCurrentWalletConnected();
                } else {
                    setBalances(0);
                }
            });
        } else {
            // / MetaMask is not installed /
            setWalletAddress("");
            console.log("Please install MetaMask");
        }
    };

    const checkBoxPrice = event => {
        setBetValue(event.target.value);
        setValidateBetOther("");
        setCheckOtherBet(false);
    }

    const checkBoxHighLow = event => {
        setBet(event.target.value)
    }

    const handleOtherCheckbox = (event) => {
        setCheckOtherBet(true);
        setBetValue(0)
        if (event.target.value >= 1000 && event.target.value <= 10000) {
            setValidateBetOther("");
            if (event.target.value % 500 === 0) {
                setBetValue(event.target.value);
            }
            else {
                setValidateBetOther(textChooseBet.numberBet);
            }
        }
        else {
            setValidateBetOther(textChooseBet.rangeBet);
        }
    }

    const DiceChange = async (value) => {
        if (value) {
            setCollection(String(value.attributes[1].trait_type + value.attributes[1].value))
        }
    }


    return (
        <>
            <div className='h-full bg-gradient-to-r pt-20 relative from-indigo-400 via-purple-400 pb-3 to-pink-300 '>
                <div className='w-full pt-4 mb-3 lg:block flex justify-center'>
                    <div className='lg:w-80 px-5 lg:ml-12 mt-4 p-2 items-center justify-center border-2 rounded-xl border-slate-100 flex from-indigo-400 via-purple-400 to-pink-300'>
                        <div className='flex text-white '>
                            <span className='text-center text-gray-100 text-2xl font-black italic mr-2 '> Play</span>
                            <span className='text-center text-green-300 text-2xl font-black italic mr-2'> Game</span>
                        </div>
                    </div>
                </div>
                <div className='lg:flex block bg-gradient-to-r from-indigo-400 via-purple-400 pb-3 to-pink-300'>
                    <div className='lg:w-1/3 relative lg:pl-32 lg:pr-0 px-32  sm:w-full sm:mx-auto w-full  lg:mx-0 ' >
                        <div className='w-full flex mb-4'>
                            <div
                                onClick={() => {
                                    setActive('Instructions');
                                    setShowIns(true)
                                }}
                                className={`w-1/2 hover:bg-gray-200 hover:text-slate-500 text-slate-50 font-semibold   items-center flex justify-center border-b-2 h-12 cursor-pointer  ${active === 'Instructions' ? 'border-green-400' : 'border-slate-50'}`}>
                                <button className=''>{textInstructions.title}</button>
                            </div>
                            <div
                                onClick={() => {
                                    setActive('Play');
                                    setShowIns(false)
                                }}
                                className={`w-1/2 hover:bg-gray-200  hover:text-slate-500  text-slate-50 font-semibold flex justify-center border-b-2 h-12 cursor-pointer ${active === 'Play' ? 'border-green-400' : 'border-slate-50'}`}>
                                <button className=''>Play</button>
                            </div>
                        </div>
                        {
                            isShowIns ?
                                <div className=' bg-slate-50 px-8 py-8 mb-4 rounded-xl'  >
                                    <div className=''>
                                        <div className='flex '>
                                            <span className='text-slate-500 font-semibold leading-6'>
                                                {textInstructions.content}
                                            </span>
                                        </div>
                                    </div>
                                </div> :
                                <>
                                    <div className='bg-slate-50 rounded-lg pb-4 px-4 py-2'>
                                        <div className=' text-slate-800'>
                                            <h4 className='text-center py-2'>{textChooseBet.title}</h4>
                                            <div className='w-full flex md:w-full px-3 border-t flex-wrap border-slate-300 pt-3'>
                                                <div className='w-full flex'>
                                                    <div className='col-6'>
                                                        <div className='form-check'>
                                                            <input className="form-check-input" type='radio' value="1000" name='checkMoney' id='checkMoney' onChange={checkBoxPrice} defaultChecked />
                                                            <label className="form-check-label ">
                                                                {textChooseBet.bet1}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className='col-6'>
                                                        <div className='form-check'>
                                                            <input className="form-check-input" type='radio' value="1500" name='checkMoney' id='checkMoney' onChange={checkBoxPrice} />
                                                            <label className="form-check-label ">
                                                                {textChooseBet.bet2}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='w-full flex mt-2'>
                                                    <div className='col-6'>
                                                        <div className='form-check'>
                                                            <input className="form-check-input" type='radio' value="2000" name='checkMoney' id='checkMoney' onChange={checkBoxPrice} />
                                                            <label className="form-check-label ">
                                                                {textChooseBet.bet3}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className='col-6'>
                                                        <div className='form-check'>
                                                            <input className="form-check-input" type='radio' value="2500" name='checkMoney' id='checkMoney' onChange={checkBoxPrice} />
                                                            <label className="form-check-label ">
                                                                {textChooseBet.bet4}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='row mt-2'>
                                                    <div className=''>
                                                        <div className='form-check'>
                                                            <input className="form-check-input" type='radio' defaultValue={0} name='checkMoney' onChange={handleOtherCheckbox} />
                                                            <label className="form-check-label ">
                                                                {textChooseBet.other}
                                                            </label>
                                                        </div>
                                                        <div className={`${checkOtherBet ? 'showOtherBet' : 'hide'} w-full`} style={{ marginTop: "0.9rem" }}>
                                                            <input className="form-control " type="number" id="focus" onChange={handleOtherCheckbox} placeholder='Input your bet' style={{ 'width': '100%' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <label className='text-danger mt-2 ps-5'>{validateBetOther}</label>
                                    </div>
                                    <div className='row mt-4 px-2 '>
                                        <div className='bg-slate-50 rounded-lg text-slate-800 p-4'  >
                                            <h4 className='text-center pb-2'>{textBetting.title}</h4>
                                            <div className='w-full flex md:w-full px-3 pt-3 border-t border-slate-300'>
                                                <div className=' w-full flex' >
                                                    <div className="w-1/2">
                                                        <input className="form-check-input" type='radio' value="HIGH" name='HighLow' id='HIGH' onChange={checkBoxHighLow} defaultChecked />
                                                        <label className="form-check-label  mx-2">{textBetting.high}</label>
                                                    </div>
                                                    <div className=" w-1/2">
                                                        <input className="form-check-input" type='radio' value="LOW" name='HighLow' id='LOW' onChange={checkBoxHighLow} />
                                                        <label className="form-check-label  mx-2">{textBetting.low}</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className=' text-slate-50 font-semibold mt-4 py-2 rounded-xl' style={{ 'backgroundImage': 'linear-gradient(25deg, #21d4fd, #1062d9 50%, #017eff)' }}>
                                            <div className='card-body '>
                                                <div className='w-full relative'>
                                                    <button id="status" className=' w-full cursor-auto '>  {textStatus.clickPlay}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                        }
                    </div>
                    <div className='lg:w-2/3 w-full px-32 pt-16  '>
                        <div className='lg:flex block  bg-slate-50 text-slate-800 rounded-xl'>
                            <div className='lg:w-1/2 w-full flex items-center justify-center' >
                                <div className='w-32 mt-5 flex items-center justify-center relative  lg:w-1/2 rounded-full' style={{ 'backgroundColor': '#d28ff0' }}>
                                    <img className='w-full cursor-pointer hover:opacity-70 ' src={imageStart} onClick={rollDice} alt="" />

                                </div>
                            </div>
                            <div className='rounded-xl lg:w-1/2 w-full flex justify-center items-center flex-col' style={{ 'height': '484px' }}>
                                <div>
                                    <h5 className={chainId === '0x5' || walletAddress === '' ? 'hide' : 'text-danger'} >{textGame.switchNetwork}</h5>
                                </div>
                                <div>
                                    <button className='button' onClick={connectWallet}>
                                        <span style={{ color: 'white' }}>{walletAddress && walletAddress.length > 0
                                            ? `Connected: ${walletAddress.substring(
                                                0,
                                                6
                                            )}...${walletAddress.substring(38)}`
                                            : "Connect Wallet"}</span>
                                    </button>
                                </div>
                                {!isLoading ?
                                    <>
                                        <div style={{ display: 'flex', margin: 20 }}>
                                            <img src={firstDieImage} className="die" alt="Die one" />
                                            <img src={secondDieImage} className="die" alt="Die two" />
                                            <img src={thirdDieImage} className="die" alt="Die third" />
                                        </div>
                                        <span className='text-xl'>{totalDice}</span>
                                        <span className='text-xl text-center leading-10 inline-block  font-semibold bg-blue-500 px-5 rounded-xl mt-3 text-white' style={{ 'fontSize': '17px' }}>{totalDice > 10 ? "High" : "Low"}</span>

                                    </>
                                    :
                                    <div style={{ display: 'flex', margin: 20 }} className={isLoading ? 'pb-5 mb-5' : ''}>
                                        <img src={require(`../assets/${collection}/${Math.floor(Math.random() * 6) + 1}.png`)} className="die" alt="Die one" />
                                        <img src={require(`../assets/${collection}/${Math.floor(Math.random() * 6) + 1}.png`)} className="die" alt="Die two" />
                                        <img src={require(`../assets/${collection}/${Math.floor(Math.random() * 6) + 1}.png`)} className="die" alt="Die third" />
                                    </div>
                                }
                                <span className={`${isLoading ? 'pt-5 mt-5' : 'pt-2'} mt-3 text-xl`}>{textGame.balance}{balances.toString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    isLoading &&
                    <div className={` inset-0 z-40 fixed flex justify-center items-center text-white `} style={{ 'backgroundColor': '#0000006e' }}>
                        <span className="text-xl mr-2"><Loading /></span>
                        <span className="text-xl font-semibold">Please wait a moment...</span>
                    </div>
                }
                {showModal &&
                    <div className="fixed inset-0 z-20 flex items-center justify-center" style={{ 'backgroundColor': '#0000006e' }}>
                        <AnimationWin statusGame={statusGame} />
                    </div>
                }
            </div >

        </>
    );
}

export default PlayGame;