"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import RoleCaptionTable from "../role-and-permission/_components/RoleCaptionTable";

export default function RolePermissionModal({ open, setOpen }) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] custom-scrollbar h-full bg-white z-[9999] overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between px-6 py-4 items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Add Role
              </Dialog.Title>

              <div className="flex gap-2">
                <div className="bg-[#087B5D] text-white rounded-md px-4 py-2 text-[0.8rem]">
                  Save
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="px-6 ">
              {/*Name input  */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="roleName"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="roleName"
                    name="roleName"
                    placeholder="Enter Role Name"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            {/* Role Caption Table */}
            <RoleCaptionTable />
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
