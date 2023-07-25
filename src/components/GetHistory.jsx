import React, { useState } from "react";
import { Loading } from "./Loading";
import { ethers } from "ethers";
import { statusHistory } from "../constants";
import { contractAddress } from '../solidity/contractAddress';
import abi from '../solidity/abi.json';
import { useEffect } from "react";
import Win from "../image/win.png";
import Lose from "../image/lose.png";
export const GetHistory = () => {
  const [isLoadingHistory, setLoadingHistory] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [fcContract, setFcContract] = useState();
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    setDataHistory([])
    getCurrentWalletConnected()
  }, [walletAddress])

  const getHistory = async () => {
    setLoadingHistory(!isLoadingHistory);
    let etherscanProvider = new ethers.providers.EtherscanProvider("goerli");
    await etherscanProvider
      .getHistory(walletAddress)
      .then(async (history) => {
        const filterHistory = history.filter((current) => {
          return current.to === contractAddress;
        });
        if (filterHistory.length > 0) {
          const iface = new ethers.utils.Interface(abi);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          let listHistory = [];
          for (let i = 0; i < filterHistory.length; i++) {
            await provider
              .getTransactionReceipt(filterHistory[i].hash)
              // eslint-disable-next-line no-loop-func
              .then((item) => {
                if (item.logs.length > 0) {
                  const result = iface.parseLog({
                    topics: item.logs[item.logs.length - 1].topics,
                    data: item.logs[item.logs.length - 1].data,
                  });
                  result["transactionId"] = item.transactionHash;
                  result["transactionIndex"] = i;
                  listHistory = [...listHistory, result];
                }
              });
          }
          listHistory.sort((a, b) => {
            if (a.transactionIndex < b.transactionIndex) return 1;
            if (a.transactionIndex > b.transactionIndex) {
              return -1;
            }
            return 0;
          });
          if (listHistory.length > 10) {
            setDataHistory(listHistory.slice(0, 10));
          }
          else {
            setDataHistory(listHistory);
          }
        }
      })
      .catch((error) => {
        console.log("err:", error);
      });
    setLoadingHistory(isLoadingHistory);
  };

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
          // / local contract instance /
          const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
          setFcContract(tempContract);
          setWalletAddress(accounts[0])
          // await tempContract.isOwner().then((result) => { setIsOwner(result) });
        } else {
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


  return (
    <div className="bg-gradient-to-r pt-28 relative from-indigo-400 via-purple-400 to-pink-300 w-full sm:h-full " >
      {
        isLoadingHistory &&
        <div className={` inset-0 z-40 fixed flex justify-center items-center text-white`} style={{ 'backgroundColor': '#0000006e' }}>
          <span className="text-xl mr-2"><Loading /></span>
          <span className="text-xl font-semibold">Please wait a moment...</span>
        </div>
      }
      <h4 className="text-white text-center">Histories</h4>
      <div className='w-full flex justify-center pt-2 bg-gradient-to-r  from-indigo-400 via-purple-400 to-pink-300 '>
        <div className="card w-4/5 p-2 border-white !bg-slate-200" style={{ backgroundColor: "#282c34", minHeight: "350px" }}>
          <div className="card-body bg-slate-200">
            <div className="flex justify-end w-full">
              <div className='flex items-center justify-center relative rounded-full w-36' style={{ 'backgroundColor': '#d28ff0' }}>
                <button
                  className="button mt-0" style={{ 'width': '100%', 'marginTop': '0px' }} onClick={getHistory}>
                  Get history</button>
                <div className={` ${isLoadingHistory ? '' : 'hidden'}  w-full h-full z-20 absolute`} style={{ 'backgroundColor': '#0000006e' }}>
                </div>
              </div>
            </div>
            <div>
              <table className="table-auto md:table-fixed text-slate-700 w-full">
                <thead className="border-b-2 border-white w-full">
                  <tr>
                    <th className="w-1/5 py-2 text-lg">Status</th>
                    <th className="w-3/5 py-2 text-lg">Transaction ID</th>
                    <th className="w-1/5 py-2 text-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dataHistory.map((value, index) => {
                    return (
                      <tr key={index} className="border-b-2 border-white h-10 text-lg">
                        <td className="flex items-center">
                          {value.args.resultExchange ? statusHistory.EXCHANGE : value.args.bet
                            ? value.args.resultBet === true
                              ? <img src={Win} alt="" className="w-1/2 h-16" />
                              : <img src={Lose} alt="" className="w-1/2 h-14" />
                            : <p className="w-1/2 h-14 flex justify-center items-center m-0 font-bold text-slate-900">{statusHistory.FAUCET}</p>}
                        </td>
                        <td>
                          <a href={`https://goerli.etherscan.io/tx/${value.transactionId}`} target="blank" className="block lg:hidden">
                            {value.transactionId
                              ? `${value.transactionId.substring(
                                0,
                                6
                              )}...${value.transactionId.substring(60)}`
                              : ""}
                          </a>
                          <a href={`https://goerli.etherscan.io/tx/${value.transactionId}`} target="blank" className="hidden lg:block">
                            {value.transactionId}
                          </a>
                        </td>

                        <td>
                          {value.args.resultExchange ? `+ ${value.args.money.toString()}` : value.args.textCode
                            ? `+ ${value.args.amountFaucet.toString()}`
                            : value.args.specialReward === true
                              ? value.args.resultBet === true
                                ? `+ ${value.args.amount}`
                                : `- ${value.args.amount}`
                              : value.args.resultBet === true
                                ? `+ ${value.args.amount / 2}`
                                : `- ${value.args.amount}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
