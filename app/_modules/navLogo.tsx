import React from "react";
import Image from "next/image";

export default function NavLogo() {
  return (
    <>
      <Image src="/clover.png" alt="Logo" width={50} height={50} />
      <h1 className="layout-title">Monrton 管理系统</h1>
    </>
  );
}
