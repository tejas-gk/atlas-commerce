import React from "react";
import { X } from "lucide-react";

const DeleteDiscountCodeModal = ({
  discount,
  onClose,
  onConfirm,
}: {
  discount: any;
  onClose: () => void;
  onConfirm?: any;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[450px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#dde1bc] pb-3">
          <h3 className="text-xl text-[#17320f]">Delete Discount Code</h3>
          <button onClick={onClose} className="text-[#687259] hover:text-[#17320f]">
            <X size={22} />
          </button>
        </div>

        {/* Warning Message */}
        <p className="text-[#556244] mt-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#17320f]">
            {discount.public_name}
          </span>
          ?
          <br />
          This action **cannot be undone**.
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
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-semibold transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountCodeModal;
