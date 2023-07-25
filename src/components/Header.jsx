import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
    const [showList, setShowList] = useState(false)
    return (
        <>

            <div className=""  >
                <nav className=" z-10 fixed w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300" >
                    <div className=" px-14  mx-auto shadow-2xl py-3">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex">
                                <Link className="" to="/">
                                    <img className="w-16 h-16 rounded-3xl" src="https://th.bing.com/th/id/OIP.nHzSb0Gjs1FbC1tw1rWf4wHaHa?w=189&h=189&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Workflow" />
                                </Link>
                                <div className='flex pl-2  justify-center text-white flex-col'>
                                    <span className='text-center text-gray-100 text-2xl font-black italic '> DICEGAME</span>
                                </div>
                            </div>
                            <div className=" flex items-center ">
                                <div className="hidden md:block">
                                    <div className="flex items-baseline ml-10 space-x-4">
                                        <Link className="text-gray-100  hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/">
                                            <span className="inline-block ">Play game</span>
                                        </Link>
                                        <Link className="text-gray-100 hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/get-NFT">
                                            <span className="inline-block  ">NFTs</span>
                                        </Link>
                                        <Link className="text-gray-100  hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/get-history">
                                            <span className="inline-block ">Histories</span>
                                        </Link>
                                        <Link className="text-gray-100  hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/Faucet">
                                            <span className="inline-block ">Faucet</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="block">
                                <div className="flex items-center ml-4 md:ml-6 ">
                                </div>
                            </div>
                            <div className="flex -mr-2 md:hidden animate-header" >
                                <button className="text-gray-200 hover:text-gray-300 inline-flex items-center justify-center p-2 rounded-md focus:outline-none" onClick={() => setShowList(!showList)} >
                                    <svg width="20" height="20" fill="currentColor" className="w-8 h-8" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1664 1344v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45z">
                                        </path>
                                    </svg>

                                </button>
                            </div>
                        </div>
                    </div>
                    {
                        showList &&
                        <div className="md:hidden " >
                            <div className='fixed inset-0 ' style={{ 'backgroundColor': '#372e2e57' }}>
                            </div>

                            <div className="flex flex-wrap w-full h-screen animate-header z-10 fixed top-0 " onClick={() => setShowList(false)}>

                                <div className="w-64 h-full  shadow-lg bg-white" onClick={(e) => e.stopPropagation()} >
                                    <div className="flex items-center space-x-4  mb-5">
                                    </div>
                                    <ul className=" text-base">
                                        <li className='pt-2'>

                                            <Link className="text-slate-800  hover:text-slate-500 px-3 py-2 rounded-md text-lg font-semibold" to="/">
                                                <span className="inline-block ">Play game</span>
                                            </Link>
                                        </li>
                                        <hr class="border border-red-500  duration-300" />
                                        <li className='pt-2'>

                                            <Link className="text-gray-800  hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/get-NFT">
                                                <span className="inline-block ">NFTs</span>
                                            </Link>
                                        </li>
                                        <hr class="border border-blue-500 cursor-pointer  duration-300" />
                                        <li className='pt-2'>

                                            <Link className="text-gray-800  hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/get-history">
                                                <span className="inline-block ">Histories</span>
                                            </Link>
                                        </li>
                                        <hr class="border border-blue-500 cursor-pointer  duration-300" />
                                        <li className='pt-2'>
                                            <Link className="text-gray-800  hover:text-slate-500 px-3 py-2 rounded-md text-base font-medium" to="/faucet">
                                                <span className="inline-block ">Faucet</span>
                                            </Link>
                                        </li>
                                        <hr class="border border-blue-500 cursor-pointer  duration-300" />
                                    </ul>

                                </div>
                            </div>
                        </div>
                    }
                </nav>
            </div>
        </>
    )
}
