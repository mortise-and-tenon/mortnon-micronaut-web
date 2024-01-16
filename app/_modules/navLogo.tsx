import React from "react";
import Image from "next/image";
import {Typography} from "@mui/material";
import './style.css'

export default function NavLogo() {
  return (
    <>
      <Image src="/clover.png" alt="Logo" width={32} height={32} className="logo"/>
      <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Monrton后台管理系统
          </Typography>
    </>
  );
}
