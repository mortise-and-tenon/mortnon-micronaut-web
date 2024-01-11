"use client";

import Image from "next/image";
import { Button } from "@mui/material";
import "./style.css";
import Footer from "./_modules/footer";
import NavLogo from "./_modules/navLogo";
import Header from "./_modules/header";



export default function Home() {
  return (
    <div className="layout">
      <Header>
        <NavLogo/>
      </Header>
      <div className="layout-content"><Button variant="contained">Hello world</Button></div>
      <Footer/>
    </div>
  );
}
