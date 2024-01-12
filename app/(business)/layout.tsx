"use client";

import Footer from "../_modules/footer";
import NavLogo from "../_modules/navLogo";
import Header from "../_modules/header";
import { Link, ListItemIcon, ListItemText, MenuItem, MenuList } from "@mui/material";
import { ContentCopy, ContentCut, ContentPaste } from "@mui/icons-material";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout">
      <Header>
        <NavLogo />
        <Link href="/" underline="none" color="inherit">首页</Link>
        <Link href="/user" underline="none" >系统管理</Link>
      </Header>
      <div className="layout-content">
        <div className="nav-style">
          <MenuList>
            <MenuItem>
              <ListItemIcon>
                <ContentCut fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cut</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <ContentCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <ContentPaste fontSize="small" />
              </ListItemIcon>
              <ListItemText>Paste</ListItemText>
            </MenuItem>
          </MenuList>
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}
