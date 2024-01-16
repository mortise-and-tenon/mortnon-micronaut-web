
import NotificationsIcon from "@mui/icons-material/Notifications";
import MuiAppBar from "@mui/material/AppBar";
import {
  Badge, Box,
  IconButton,
  Toolbar
} from "@mui/material";

import NavLogo from "./navLogo";

export default function Header() {
  return (
    <MuiAppBar position="absolute">
      <Toolbar
        sx={{
          pr: "24px",
        }}
      >
        <NavLogo />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit">
          <Badge badgeContent={23} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
}
