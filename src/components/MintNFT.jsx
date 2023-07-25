import React, { useEffect, useState } from "react";
import { IoHammer } from 'react-icons/io5';
import imageProcessing from '../image/image-processing.png';
import { NFTStorage } from 'nft.storage';
import { NFT_STORAGE_KEY } from '../constants';
import { textMintNFT } from "../constants";
import { Loading } from "./Loading";

export const MintNFT = ({ mintNFT, statusMintNFT }) => {
  const [imageSelected, setImageSelected] = useState(imageProcessing);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [isShowMessage, setShowMessage] = useState(false)

  const handleChangeImage = e => {
    setImageSelected(URL.createObjectURL(e.target.files[0]));
    setImages(e.target.files);
  }

  const storeNFT = (NFT) => {
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

    const image = images[0];
    const name = NFT.name;
    const description = NFT.description;
    const attributes = [
      {
        "trait_type": "RewardPercent",
        "value": NFT.rewardPercent
      },
      {
        "trait_type": "collection",
        "value": NFT.collection
      },
      {
        "trait_type": "value",
        "value": NFT.value
      }
    ];

    // call client.store, passing in the image & metadata
    return nftstorage.store({
      image,
      name,
      description,
      attributes,
    })
  };

  useEffect(() => {
    //if mintNFT success or error hide disable
    if (statusMintNFT === 'MintNFT Success' || statusMintNFT === 'Error') {
      setIsLoading(false)
      //if minNFT success show message mintNFt success
      if (statusMintNFT === 'MintNFT Success') {
        setShowMessage(true)
        document.getElementById("closeModal").click();
      }
    }

  }, [statusMintNFT])

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (isShowMessage) {
        setShowMessage(false)
      }
    }, 1500);

    return () => clearTimeout(timerId)
  }, [isShowMessage])

  const mint = async (event) => {
    //Prevent browser reload when submit
    setIsLoading(true)
    event.preventDefault();

    const form = event.target;
    const NFT = {
      name: form.setName.value,
      description: form.setDescription.value,
      rewardPercent: form.setRewardPercent.value,
      collection: form.setCollection.value,
      value: form.setValue.value
    }
    const amount = form.setAmount.value;
    const metadata = await storeNFT(NFT);
    const cid = metadata.ipnft + '/metadata.json';
    mintNFT(amount, cid)
    form.reset()
    setImageSelected(imageProcessing);
  }

  return (
    <div className='text-slate-800 ' style={{ marginTop: "2rem", width: "", marginLeft: "48px" }} >

      <div className='card-body '>
        <div className='w-full md:w-1/2  px-3 row mt-2'>
          <div className='col-4 ps-2 px-2 pr-4'>
            <button className="button mt-1 mx-0 flex items-center justify-center" data-bs-toggle="modal" data-bs-target={`#ModalCreateNFT`} >
              <span className="mr-3 text-2xl mb-1">+</span>
              {textMintNFT.createNFT}
            </button>
          </div>
        </div>
        <div className="modal fade relative" id="ModalCreateNFT" aria-labelledby="exampleModalLabel" aria-hidden="true">
          {
            isLoading &&
            <div className="absolute inset-0 flex justify-center items-center z-50" style={{ 'backgroundColor': '#0000006e' }}>
              <span className="text-white mr-2 text-xl"><Loading /></span>
              <span className="text-white text-xl">Please wait moment...</span>
            </div>
          }
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <IoHammer className='me-1 fs-5 mt-1 text-dark'></IoHammer>
                <h4 className='mt-0 mb-0 text-dark' style={{ marginLeft: '10px' }} >{textMintNFT.createNFT}</h4>
                <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className='w-full md:w-full px-3 row px-0'>
                  <form onSubmit={mint}>
                    <div className='row'>
                      <div className="m-2  d-flex justify-content-between w-full lg:flex">
                        <h5 className='mt-2 text-dark inline-block w-full lg:w-1/3'>{textMintNFT.name}</h5>
                        <input className="form-control  lg:w-2/3" id='setName' placeholder='Input name' type='text' style={{ width: "600px", height: "40px" }} required />
                      </div>
                      <div className="m-2 d-flex justify-content-between mb-4">
                        <h5 className='mt-2 text-dark inline-block w-full lg:w-1/3'>{textMintNFT.description}</h5>
                        <input className="form-control w-2/3" id='setDescription' placeholder='Input description' type='text' style={{ width: "600px", height: "40px" }} required />
                      </div>
                      <div className="d-flex justify-content-between">
                        <div className="m-2">
                          <h5 className='m-0 text-dark text-base'>{textMintNFT.rewardPercent}</h5>
                          <input className="form-control mt-2" id='setRewardPercent' placeholder='Input reward percent' type='number' style={{ height: "40px" }} required />
                        </div>
                        <div className="m-2">
                          <h5 className='m-0 text-dark text-base'>{textMintNFT.collection}</h5>
                          <input className="form-control mt-2" id='setCollection' placeholder='Input collection' type='number' style={{ height: "40px" }} required />
                        </div>
                        <div className="m-2">
                          <h5 className='m-0 text-dark text-base'>{textMintNFT.value}</h5>
                          <input className="form-control mt-2" id='setValue' placeholder='Input value' type='number' style={{ height: "40px" }} required />
                        </div>
                      </div>
                      <div className="m-2 mt-4 relative border-4 border-dashed p-3 flex items-center justify-center" style={{ height: "330px" }}>
                        <input type="file" id="file" name="file" accept="image/*" className="w-100 mb-2 inset-0 absolute opacity-0 cursor-pointer" onChange={handleChangeImage} required />
                        <img className="rounded-lg" src={imageSelected} alt="file" style={{ maxWidth: "100%", maxHeight: "300px" }} />
                      </div>
                    </div>
                    <div className='w-full mt-3 lg:flex overflow-hidden '>
                      <span className="flex overflow-hidden lg:mr-5 lg:w-1/2 float-left" >
                        <h6 className='mt-2' >{textMintNFT.amount}</h6>
                        <input className="form-control" id='setAmount' placeholder='Amount' type='number' defaultValue={1} min={1} onChange={null} style={{ height: "40px", width: "80px" }} required />
                      </span>
                      <div className="w-1/2  overflow-hidden ">
                        <button className='button relative mr-4 float-right' style={{ marginTop: "0px", marginRight: "0px" }} type='submit' >
                          {textMintNFT.submit}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {
        isShowMessage &&
        <div className="absolute inset-0  z-50">
          <div className="bg-green-500 text-white absolute bottom-5 right-5 p-3 flex items-center justify-center rounded-lg">
            <i className=" text-2xl mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2" viewBox="0 0 16 16">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
              </svg>

            </i>
            <span className="font-black">Create NFT success</span>
          </div>
        </div>
      }
    </div >
  )
}
