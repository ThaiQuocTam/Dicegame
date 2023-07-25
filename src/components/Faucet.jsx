import React, { useEffect, useState } from 'react'
import { IoWater } from 'react-icons/io5';
import '../App.css';
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.bundle"
import { ethers } from 'ethers';
import { contractAddress } from '../solidity/contractAddress';
import { Loading } from './Loading';
import abi from '../solidity/abi.json'
import { formatDate } from '../utils/dateTime';

export default function Faucet() {
    const [textCode, setTextCode] = useState(0)
    const [notify, setNotify] = useState("");
    const [isLoadingToken, setLoadingToken] = useState(false);
    const [dataTransaction, setDataTransaction] = useState([]);

    useEffect(() => {
        const timerID = setTimeout(function () {
            setNotify('')
        }, 3000);

        return () => clearTimeout(timerID)
    }, [notify])

    useEffect(() => {
        setDataTransaction([])
        getTransaction()
    }, [])

    function updateStatus(status) {
        status === 'Waiting to confirm the transaction' ? isLoadingToken(true) : isLoadingToken(false)
        const statusEl = document.getElementById("status");
        statusEl.innerHTML = status;
    }


    const getTransaction = async () => {
        // setLoadingToken(!isLoadingToken);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const tempSigner = provider.getSigner()
        const accounts = await provider.send("eth_accounts", []);
        // const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
        let etherscanProvider = new ethers.providers.EtherscanProvider("goerli");
        await etherscanProvider
            .getHistory(accounts[0])
            .then(async (transaction) => {
                let number = transaction.length;
                setDataTransaction(transaction[number - 1])
            })
    };
    const faucet = async (event) => {
        getTransaction();
        setLoadingToken(true);
        event.preventDefault();
        console.log(textCode);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        var code = event.target.setTextCode.value;
        const tempSigner = provider.getSigner()
        const accounts = await provider.send("eth_accounts", []);
        const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
        try {
            await tempContract.receiveMoney(code, accounts[0]).then((result) => {

            })
                .catch((error) => {
                    const start = error.message.indexOf("error={");
                    const end = error.message.indexOf("code=");
                    error = JSON.parse(error.message.substring(start + 6, end - 2));
                    switch (error.message) {
                        case "execution reverted: wrong token":
                            setNotify("You input fail code!");
                            setLoadingToken(false);
                            break;
                        case "execution reverck ted: lotime has not expired":
                            updateStatus("Lock time has not expired. Please try again later after 24h!")
                            break;
                        default:
                            setNotify("Error, input token is empty!");
                            setLoadingToken(false)
                    }
                })
            tempContract.on("TransferSingle", (value) => {
                setNotify("Get token success!");
                setLoadingToken(false);
            })
        }
        catch (err) {
            setLoadingToken(false);
            console.log(err.message);
        }
        // Use to render balance when get token succeeds
        tempContract.on("TransferSingle", (value) => {
            setTextCode(value.toString() + Math.random())
        })
        // Clear input
        const codeEl = document.getElementById("setTextCode");
        codeEl.value = "";
    }
    useEffect(() => {
        getTransaction()
    }, [])

    let timestamp = dataTransaction.timestamp

    return (
        <div className=' pt-40 overflow-auto flex justify-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300'>

            {
                isLoadingToken &&
                <div className={` inset-0 z-20 fixed flex justify-center items-center text-white `} style={{ 'backgroundColor': '#0000006e' }}>
                    <span className="text-xl mr-2"><Loading /></span>
                    <span className="text-xl font-semibold">Please wait a moment...</span>
                </div>
            }
            <div className='flex pt-20 px-9 absolute sm:bottom-0  mx-auto sm:max-w-5xl w-full justify-start  flex-col rounded-3xl border lg:bottom-auto bg-slate-100 shadow-2xl '>
                <div className='mb-4 rounded-lg '>
                    <div className='relative flex rounded-lg h-full border '>
                        <div className='mt-8 text-center w-full ' >
                            <div className='pt-6 '>
                                <div className='text-white m-0 flex pl-4'>
                                    <IoWater className='text-slate-700 me-1 fs-5 mt-1'></IoWater>
                                    <h5 className='m-0 text-slate-700'>Get token from a faucet for the dice game</h5>
                                </div>
                                <div className='w-full  px-3 flex '>
                                    <form className='w-full' onSubmit={faucet}>
                                        <div className=' mt-4 flex mb-6'>
                                            <div className=" w-3/4 ml-5" >
                                                <input className="form-control" id='setTextCode' placeholder='Input code' type='text' style={{ height: "40px" }} />
                                            </div>
                                            <div className=' ml-3 w-1/5 flex items-center justify-center relative rounded-full' style={{ 'backgroundColor': '#d28ff0' }}>
                                                <button
                                                    className="button " style={{ 'width': '100%', 'marginTop': '0px' }} >
                                                    Get Token</button>
                                                <div className={` ${isLoadingToken ? '' : 'hidden'}  w-full h-full z-20 absolute`} style={{ 'backgroundColor': '#0000006e' }}>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <label className='text-red-900 mt-3'>{notify}</label>
                                        </div>

                                    </form>
                                </div>
                                <div className=' relative py-4 rounded-md'>
                                    <div className='rounded-lg border mx-8 '>
                                        <div className=" flex w-full items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500 text-neutral-500 lg:flex-wrap lg:justify-start ">
                                            <div className='flex w-full  items-center justify-center'>
                                                <div className=" items-center lg:!flex lg:basis-auto py-3 w-4/5 justify-center">
                                                    <span className='text-lg font-semibold text-white'>Your Transactions</span>
                                                </div>
                                                <div className=' items-center justify-center lg:!flex lg:basis-auto py-3 w-1/5'>
                                                    <span className=' text-lg font-medium text-white'>Time</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border border-t-0 border-neutral-100 bg-white ">
                                            <div className='flex w-full flex-wrap items-center justify-between px-1'>
                                                <div className=" items-center justify-start lg:!flex lg:basis-auto py-4 w-3/5">
                                                    <a href={`https://goerli.etherscan.io/tx/${dataTransaction.hash}`} target="blank" className="block lg:hidden text-slate-700 px-2 no-underline">
                                                        {dataTransaction.hash
                                                            ? `${dataTransaction.hash.substring(0, 6)}...${dataTransaction.hash.substring(60)}` : ""}
                                                    </a>
                                                    <a href={`https://goerli.etherscan.io/tx/${dataTransaction.hash}`} target="blank" className="hidden lg:block text-slate-700 px-2 no-underline">
                                                        {dataTransaction.hash}
                                                    </a>
                                                </div>
                                                <div className='items-center justify-end lg:!flex lg:basis-auto py-4 px-3 w-2/5'>
                                                    <span className='text-base font-medium'>{formatDate(timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
