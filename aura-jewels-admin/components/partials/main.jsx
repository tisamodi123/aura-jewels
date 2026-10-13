"use client";
import Header from "./header";
import Sidebar from "./sidebar";
import { useState } from "react";

export default function main({ children }) {
  const [isShowMenu, setIsShowMenu] = useState(true);

  const handleShowMenu = (flag) => {
    setIsShowMenu(flag);
  };

  return (
    <div className="overflow-hidden">
      <Header isShowMenu={isShowMenu} handleShowMenu={handleShowMenu} />
      <div className="flex bg-[#F5F8FC]">
        <Sidebar isShowMenu={isShowMenu} />
        <main className=" w-full p-5 h-[91vh] overflow-auto  bg-[#F5F8FC]">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
