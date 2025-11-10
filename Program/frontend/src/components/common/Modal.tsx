import React, { useEffect } from "react";

type ModalProps = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number; // px
    maxHeight?: number; // px
};

export default function Modal({
                                  open,
                                  title,
                                  onClose,
                                  children,
                                  width = 720,
                                  maxHeight = 560,
                              }: ModalProps) {
    // close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            role="dialog"
            aria-modal="true"
            aria-label={title || "Modal"}
            onClick={(e) => {
                // click outside the box closes
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="modal_box"
                style={{ width, maxHeight }}
            >
                <div className="modal_header">
                    <h3 className="modal_title">{title}</h3>
                    <button
                        className="modal_close_btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="modal_body">{children}</div>

                <div className="modal_footer">
                    <button className="btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
