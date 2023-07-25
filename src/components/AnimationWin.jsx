import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

export const AnimationWin = ({ statusGame }) => {
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

    const detectSize = () => {
        setWindowDimension({ width: window.innerWidth, height: window.innerHeight })
    }

    useEffect(() => {
        window.addEventListener('resize', detectSize);
        return () => {
            window.removeEventListener('resize', detectSize);
        }
    }, [windowDimension])

    return (
        <>
            {
                statusGame === true ?
                    <div className="modal fade d-flex show" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ backgroundColor: 'white !important' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div>
                                <img src={require(`../image/win.png`)} alt='' />
                            </div>
                        </div>
                        <ReactConfetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                        />
                    </div>
                    :
                    <div className="modal fade d-flex show" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div>
                                <img style={{ minWidth: '450px', marginLeft: '40px' }} src={require(`../image/lose.png`)} alt='' />
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}
