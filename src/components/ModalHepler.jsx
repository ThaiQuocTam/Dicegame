import * as bootstrap from "bootstrap";

export function OpenModalBootstrap(elementRef) {
    const modalEle = elementRef.current
    const bsModal = new bootstrap.Modal(modalEle, {
        backdrop: 'static',
        keyboard: true,
    })
    bsModal.show();
}

export function CloseModalBootstrap(elementRef) {
    const modalEle = elementRef.current
    var bsModal = bootstrap.Modal.getInstance(modalEle)
    bsModal?.hide();
}

export class ConfigModal {
    constructor(width, modalRef) {
        this.width = width;
        this.modalRef = modalRef;
    }
}

export class ConfigModalConfirm {
    constructor(width, modalRef, top) {
        this.width = width;
        this.modalRef = modalRef;
        this.top = top;
    }
}
