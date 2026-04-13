import { X } from "lucide-react";
import React from "react";

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
}: any) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg md:w-[450px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#dde1bc] pb-3">
          <h3 className="text-xl text-[#17320f]">Delete Product</h3>
          <button onClick={onClose} className="text-[#687259] hover:text-[#17320f]">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <p className="text-[#556244] mt-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#17320f]">{product.title}</span>?
          <br />
          This product will be moved to a **delete state** and permanently
          removed **after 24 hours**. You can recover it within this time.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-[#f7f8ea] hover:bg-[#eef0d5] px-4 py-2 rounded-md text-[#17320f] border border-[#dde1bc] transition"
          >
            Cancel
          </button>
          <button
            onClick={!product?.isDeleted ? onConfirm : onRestore}
            className={` ${
              product?.isDeleted
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } px-4 py-2 rounded-md text-white font-semibold transition`}
          >
            {product?.isDeleted ? "Restore" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
