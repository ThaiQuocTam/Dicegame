import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress } from '../solidity/contractAddress';
import abi from '../solidity/abi.json';
import ExchangeNFT from "./Exchange";
import { useDispatch, useSelector } from "react-redux";
import { getNftSlice } from "../reduxs/NftSlice";
import { MintNFT } from "./MintNFT";
import { Loading } from "./Loading";
import { getNftSelector } from "../reduxs/selector";

export const GetNFT = () => {
  const [isLoadingNFT, setLoadingNFT] = useState(false);
  const [checkExchange, setCheckExchange] = useState(true);
  const [dataNFT, setDataNFT] = useState([]);
  const [open, setOpen] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const dispatch = useDispatch()
  const [isOwner, setIsOwner] = useState(false);
  const [fcContract, setFcContract] = useState();
  const [statusMintNFT, setStatusMintNFT] = useState('')
  const [NFTExchange, setNFTExchange] = useState()
  const NftSelector = useSelector(getNftSelector)
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoadingExchangeAll, setIsLoadingExchangeAll] = useState(false)

  const handleToggle = (id) => {
    setOpen(!open)
    setIdToken(id)
  }

  useEffect(() => {
    getCurrentWalletConnected()
    handleGetNFT()
  }, [walletAddress])

  const handleGetNFT = async () => {
    setLoadingNFT(true);
    setDataNFT([])
    setCheckExchange(false);
    if (!walletAddress) {
      return;
    }
    // / get provider /
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // / get signer /
    const tempSigner = provider.getSigner();
    // / local contract instance /
    const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
    let temp = await tempContract._totalNFT();
    const totalNFT = temp.toNumber();
    const items = [];
    let attributes = [];
    let lstAttributes = [];
    let listIdToken = [];
    let listTokenIdOwner = [];
    for (let i = 1; i <= totalNFT; i++) {
      try {
        let amount = await tempContract.balanceOf(walletAddress, i);
        let amountOwner = await tempContract.balanceOf(await tempContract.owner(), i);
        if (amount.toString() !== "0") {
          await tempContract.uri(i).then(async (uri) => {
            await fetch(uri).then(res => res.json()).then((res) => {
              items.push(res);
              attributes.push(res.attributes);
            })
              .catch((e) => console.log(e))
          })
          items[items.length - 1]["image"] = 'https://ipfs.io/ipfs/' + items[items.length - 1]["image"].substring(7);
          items[items.length - 1]["amount"] = amount.toString();
          listIdToken.push(i);
          items[items.length - 1]["idToken"] = i;
        }
        if (amountOwner.toString() !== "0") {
          listTokenIdOwner.push(i);
        }
      }
      catch (err) {
        console.log(err);
      }
    }
    attributes.forEach((item) => {
      lstAttributes.push(item[0]);
    })
    if (items && items.length !== 0) {
      setLoadingNFT(false)
      if (items.length > 5) {
        // setDataNFT(items.slice(0, 5));
        setDataNFT(items)
        sendData(lstAttributes);
      }
      else {
        setDataNFT(items);
        sendData(lstAttributes);
      }
    }
    else {
      setLoadingNFT(false)
      sendData(lstAttributes);
      if (document.getElementById("statusGetNFT")) {
        document.getElementById("statusGetNFT").innerHTML = "Please play game to get NFT"
      }
    }
    const checkItem = items.find((item) => item.name === NftSelector.getNft.name)
    if (!checkItem) {
      dispatch(getNftSlice.actions.getNftAction({}))
    }
  }

  const ChangeDice = async (value) => {
    dispatch(getNftSlice.actions.getNftAction(value))
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
          // / local contract instance /
          const tempContract = new ethers.Contract(contractAddress, abi, tempSigner)
          setFcContract(tempContract);
          setWalletAddress(accounts[0])
          await tempContract.isOwner().then((result) => { setIsOwner(result) });
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

  const sendData = (data) => {
    dispatch(getNftSlice.actions.rewardDataAction(data))
  }

  const callBackMintNft = async (amount, cid) => {
    try {
      await fcContract.mintToken(amount, cid)
        .then(() => {
          setStatusMintNFT('Confirmed')
        })
        .catch(() => {
          setStatusMintNFT('Error')
        })
    } catch (error) {

    }
    fcContract.on("TransferSingle", (value) => {
      setStatusMintNFT('MintNFT Success')
    })

  }

  const handleExChangeAll = () => {
    setIsLoadingExchangeAll(true)
    const id = []
    const valueExchange = []
    const value = []
    dataNFT.map((item) => {
      id.push(Number(item.idToken))
      valueExchange.push(Number(item.amount))
      value.push(Number(item.attributes[2].value))
    })
    // const id = [Number(itemNFT.idToken)];
    // const valueExchange = [quantityNFTExchange];
    // const value = [Number(itemNFT.attributes)];
    exchange(id, valueExchange, value);
  }

  const exchange = async (idNFT, amount, value) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tempSigner = provider.getSigner();
      const temContract = new ethers.Contract(contractAddress, abi, tempSigner)

      await temContract.withdrawToken(idNFT, amount, value)
      // Use to render balance when exchange succeeds
      temContract.on("TransferSingle", (value) => {
        setIsLoadingExchangeAll(false)
        handleGetNFT()
      })
    } catch (error) {
      setIsLoadingExchangeAll(false)
    }
  }

  return (
    <>
      <div className=" bg-gradient-to-r pt-20 relative from-indigo-400 via-purple-400 to-pink-300 h-full w-full">
        {
          isLoadingExchangeAll &&
          <div className={` inset-0 z-40 fixed flex justify-center items-center text-white `} style={{ 'backgroundColor': '#0000006e' }}>
            <span className="text-xl mr-2"><Loading /></span>
            <span className="text-xl font-semibold">Please wait a moment...</span>
          </div>
        }
        <div className='w-full mb-3 lg:block pt-4 flex justify-center'>
          <div className='lg:w-80 px-5 lg:ml-12 mt-4 p-2 items-center justify-center border-2 rounded-xl border-slate-100 flex from-indigo-400 via-purple-400 to-pink-300'>
            <div className='flex  text-white '>
              <span className='text-center text-gray-100 text-2xl font-black italic mr-2 '> NFTs</span>
            </div>
          </div>

          {
            isOwner ?
              <div className={`px-2`}>
                <MintNFT mintNFT={callBackMintNft} statusMintNFT={statusMintNFT} />
              </div> :
              <div className="ml-12">
                <button className="button" onClick={handleExChangeAll}>Exchange All</button>
              </div>
          }

        </div>

        <div className="flex justify-center px-5  flex-wrap bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300">
          {
            isLoadingNFT ?
              <div className="text-slate-50 flex fixed justify-center items-center inset-0 bg-slate-300 z-20 " style={{ 'backgroundColor': '#0000006e' }}>
                <div>
                  <span className="text-xl mr-2"><Loading /></span>
                  <span className="text-xl font-semibold">Please wait a moment...</span>
                </div>
              </div>
              :
              dataNFT.map((value, index) => {
                return (
                  <div key={index} className="bg-slate-300 mx-2 my-2  group/item hover:cursor-pointer relative" style={{ width: '285px', height: '413px' }}>
                    <a href={value.image} target="blank" className="no-underline overflow-hidden flex justify-center img-zoom-on-hover mt-3 mb-5 rounded-xl z-1 h-3/5">
                      <img src={value.image} alt="" className="object-contain w-full " />
                      <div className="rounded-xl absolute top-2 left-2 font-bold text-slate-700 flex justify-center">x{value.amount}</div>
                    </a>
                    <div className="font-semibold text-black flex justify-center my-4 md:my-3 lg:my-2">{value.name}</div>
                    <div className={`absolute bottom-0 items-center group-hover/item:flex w-full ${open && value.idToken === idToken ? 'flex' : 'hidden'}`}>
                      {
                        NftSelector && NftSelector.getNft.name === value.name ?
                          <button
                            onClick={() => dispatch(getNftSlice.actions.getNftAction({}))}
                            className="button align-items-center  !mt-0.5 !w-4/5 !rounded-bl-lg shadow-none" >Applied</button>
                          :
                          <button className="button align-items-center  !mt-0.5 !w-4/5 !rounded-bl-lg shadow-none" onClick={() => ChangeDice(value)}>Apply</button>

                      }
                      <button className="button pb-2 items-center !mt-0.5 !w-1/5 !rounded-br-lg shadow-none no-underline flex justify-center hover:text-white font-bold" onClick={() => handleToggle(value.idToken)}>. . .</button>
                      <div className={`absolute bottom-10 right-0 rounded-sm bg-slate-200 ${open && value.idToken === idToken ? 'block' : 'hidden'}`} >
                        <div className="flex justify-center z-0 flex-col">
                          <button
                            onClick={() => setNFTExchange(value)}
                            className={`!ml-0 hover:opacity-80 ${checkExchange === true || dataNFT.length === index ? 'button-disable' : 'button'}`} data-bs-toggle="modal" data-bs-target={`#ModalNFT`} style={{ marginTop: "0px", width: "120px", marginLeft: "20px" }} disabled={checkExchange === true || dataNFT.length === 0 ? true : false}>
                            Exchange
                          </button>
                          <a className="button !ml-0 mt-0 no-underline flex justify-center items-center hover:opacity-80 hover:text-white" style={{ 'width': "120px", 'marginLeft': "20px" }} href={`https://testnets.opensea.io/assets/goerli/${contractAddress}/${value.idToken}`} rel="noreferrer" target="_blank" >
                            Link
                          </a>
                        </div>
                      </div>
                    </div>
                    <ExchangeNFT NFTExchange={NFTExchange} getNFT={handleGetNFT}></ExchangeNFT>
                  </div>
                );
              })}
        </div>
        <div className="text-center">
          <span id="statusGetNFT" className="text-center text-slate-50 text-xl font-semibold"></span>
        </div>
      </div>

    </>
  )
}