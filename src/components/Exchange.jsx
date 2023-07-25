import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { IoWater } from 'react-icons/io5';
import { txExchange } from '../constants';
import { contractAddress } from '../solidity/contractAddress';
import abi from "../solidity/abi.json"
import { Loading } from './Loading';

const ExchangeNFT = ({ NFTExchange, getNFT }) => {
    const [quantityNFTExchange, setQuantityNFTExchange] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [itemNFT, setItemNFT] = useState({
        idToken: 0,
        description: '',
        image: '',
        name: '',
        amount: '',
        attributes: ''
    })

    useEffect(() => {
        if (NFTExchange) {
            console.log(NFTExchange);
            setItemNFT({
                ...itemNFT,
                idToken: NFTExchange.idToken,
                description: NFTExchange.description,
                image: NFTExchange.image,
                name: NFTExchange.name,
                amount: NFTExchange.amount,
                attributes: NFTExchange.attributes[2].value
            })
        }
    }, [NFTExchange])


    const exchangeNFT = (event) => {
        setIsLoading(true)
        event.preventDefault();
        const id = [Number(itemNFT.idToken)];
        const valueExchange = [quantityNFTExchange];
        const value = [Number(itemNFT.attributes)];
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
                setIsLoading(false)
                document.getElementById("closeModalBtn").click()
                getNFT()
            })
        } catch (error) {
            console.log(error);
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="modal fade" id="ModalNFT" aria-labelledby="exampleModalLabel" aria-hidden="false">
                {
                    isLoading && <div className={` inset-0 z-20 fixed flex justify-center items-center text-white `} style={{ 'backgroundColor': '#0000006e' }}>
                        <span className="text-xl mr-2"><Loading /></span>
                        <span className="text-xl font-semibold">Please wait a moment...</span>
                    </div>
                }
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <IoWater className='me-1 fs-5 mt-1 text-dark'></IoWater>
                            <h5 className='m-0 text-dark'>{txExchange.title}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className='w-full md:w-full row px-0'>
                                <form>
                                    <div className='flex flex-col' >
                                        {
                                            <div className=' flex mt-2 align-items-center'>
                                                <div className="w-1/5">
                                                    <img src={itemNFT.image || ''} height={"80%"} width={"80%"} alt='' />
                                                </div>
                                                <div className='w-3/5 ms-3'>
                                                    <div className="row">
                                                        <p className="text-dark p-0 m-0">{itemNFT.description || ''}</p>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-12 d-flex g-0">
                                                            <p className="text-dark fs-6 me-2 fw-bold">x{itemNFT.amount || ''}</p>
                                                            <p className='text-dark fs-6 my-0' >{itemNFT.attributes || ''}{txExchange.perToken}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-1/5 me-2">
                                                    <input className="form-control" id='setAmount' value={quantityNFTExchange} onChange={(e) => { itemNFT.idToken === NFTExchange && setQuantityNFTExchange(e.target.value) }} placeholder='Amount' type='number' style={{ height: "40px", width: "100px", marginBottom: "10px" }} min={1} max={itemNFT.amount || ''} />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div className='row mt-3 d-flex justify-content-end'>
                                        <button id="closeModalBtn" type="button" className="btn btn-secondary" style={{ width: "125px", marginRight: "30px" }} data-bs-dismiss="modal" aria-label="Close">{txExchange.close}</button>
                                        <button className='mt-0 mx-0 button' onClick={exchangeNFT} style={{ width: "125px" }}>{txExchange.submit}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ExchangeNFT;
