"use client";

import {
  Box,
  CssBaseline,
  Toolbar
} from "@mui/material";


import Header from "../_modules/header";
import NavSider from "../_modules/navSider";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header />
      <NavSider />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
