import React from 'react'

import {Typography,Link} from "@mui/material"; 

export default function Footer() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'版权所有 © '}
      {new Date().getFullYear()}
      {'. '}
      <Link color="inherit" href="https://github.com/mortise-and-tenon">
        Mortnon
      </Link>
    </Typography>
  )
}
