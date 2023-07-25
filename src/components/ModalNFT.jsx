import Modal from "react-overlays/Modal";
import "bootstrap/dist/css/bootstrap.css"

const ModalNFT = () => {
  const [showModal, setShowModal] = useState(false);
  <button type="button" onClick={() => setShowModal(true)}>
    Open Modal
  </button>
  var handleClose = () => setShowModal(false);
  return (
    <>
      <div className="modal-example">
        <div>
          <button type="button" onClick={() => setShowModal(true)}>
            Open Modal
          </button>
        </div>
        <p>Click to get the open the Modal</p>

        <Modal
          className="modal"
          show={showModal}
          onHide={handleClose}
          renderBackdrop={renderBackdrop}
        >
          <div>
            <div className="modal-header">
              <div className="modal-title">Modal Heading</div>
              <div>
                <span className="close-button" onClick={handleClose}>
                  x
                </span>
              </div>
            </div>
            <div className="modal-desc">
              <p>Modal body contains text.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={handleClose}>
                Close
              </button>
              <button className="primary-button" onClick={handleSuccess}>
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
export default ModalNFT
