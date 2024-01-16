import React, { ReactNode, useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuIcon from "@mui/icons-material/Menu";
import NoteIcon from "@mui/icons-material/Note";
import PersonIcon from "@mui/icons-material/Person";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export type MenuInfo = {
  id: number;
  name: string;
  icon: ReactNode;
  url: string;
  items: Array<MenuInfo>;
};

export type MenuStateMap = {
  [key: string]: boolean;
};

export async function getMenu(
  setMenus: React.Dispatch<React.SetStateAction<MenuInfo[]>>,
  setSkeletonLoading: React.Dispatch<React.SetStateAction<boolean>>,
  SetMenuState: React.Dispatch<React.SetStateAction<MenuStateMap>>
) {
  try {
    const response = await fetch("/api/menus");
    if (response.ok) {
      const body = await response.json();
      console.log("menu", body);
      const menuArray: Array<MenuInfo> = new Array<MenuInfo>();
      const menuStateMap: MenuStateMap = {};
      body.data.forEach((menuData) => {
        const menu: MenuInfo = {
          id: menuData.id,
          name: menuData.name,
          icon: renderIcon(menuData.icon),
          url: menuData.url,
          items: [],
        };
        //TODO:判断当前用户是否有相应菜单权限，有权限的才做展示
        //menuData.permission

        //递归处理子菜单
        convertMenuNode(menu, menuData.children_menu);

        if (menuData.children_menu && menuData.children_menu.length > 0) {
          menuStateMap[menuData.id.toString()] = true;
        }

        menuArray.push(menu);
      });

      setMenus(menuArray);
      console.log("items:", menuArray);

      SetMenuState(menuStateMap);
    }
  } catch (error) {
  } finally {
    console.log("menu finish.");
    //回调上层关闭骨架动画
    if (setSkeletonLoading) {
      console.log("skeleton");
      setSkeletonLoading(false);
    }
  }
}

const iconMap = {
  DashboardIcon: DashboardIcon,
  PersonIcon: PersonIcon,
  GroupsIcon: GroupsIcon,
  AccountTreeIcon: AccountTreeIcon,
  MenuIcon: MenuIcon,
  NoteIcon: NoteIcon,
};

function renderIcon(icon: string) {
  switch (icon) {
    case "DashboardIcon":
      return <DashboardIcon />;
    case "PersonIcon":
      return <PersonIcon />;
    case "GroupsIcon":
      return <GroupsIcon />;
    case "AccountTreeIcon":
      return <AccountTreeIcon />;
    case "MenuIcon":
      return <MenuIcon />;
    case "NoteIcon":
      return <NoteIcon />;
    default:
      return <TextSnippetIcon />;
  }
}

const convertMenuNode = (parentMenu: MenuInfo, children) => {
  if (children.length == 0) {
    return;
  }

  const childrenMenu: Array<MenuInfo> = new Array<MenuInfo>();
  children.forEach((child) => {
    const menu: MenuInfo = {
      id: child.id,
      name: child.name,
      icon: renderIcon(child.icon),
      url: child.url,
      items: [],
    };

    if (child.children_menu.length > 0) {
      convertMenuNode(menu, child.children_menu);
    }

    childrenMenu.push(menu);
  });

  parentMenu.items = childrenMenu;
};

export default function NavSider(props) {
  //菜单数据
  const [menus, setMenus] = useState([] as Array<MenuInfo>);
  //菜单链接数据
  const [menuLinkMap, setMenuLinkMap] = useState({} as MenuLinkMap);
  //有菜单的父菜单状态
  const [menuState, SetMenuState] = useState({} as MenuStateMap);

  const [loading, setSkeletonLoading] = useState(true);


  useEffect(() => {
    getMenu(setMenus, setSkeletonLoading, SetMenuState);
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const drawerWidth: number = 240;

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
      position: "relative",
      whiteSpace: "nowrap",
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: "border-box",
      ...(!open && {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up("sm")]: {
          width: theme.spacing(9),
        },
      }),
    },
  }));

  //侧边栏菜单展开状态
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  //父菜单点击
  const itemClick = (index) => {
    console.log("item key:", index);
    SetMenuState((openItems) => ({
      ...openItems,
      [index]: !openItems[index],
    }));
  };

  return (
    <Drawer variant="permanent" sx={{ pt: "64px" }} open={open}>
      <List component="nav">
        {menus.map((menu, index) => (
          <React.Fragment key={menu.id}>
            {menu.items && menu.items.length > 0 ? (
              <>
                <ListItemButton onClick={() => itemClick(menu.id)}>
                  <ListItemIcon>
                    <ListItemIcon>{menu.icon}</ListItemIcon>
                  </ListItemIcon>
                  <ListItemText primary={menu.name} />
                  {menuState[menu.id] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={menuState[menu.id]}>
                  {menu.items.map((child, childInext) => (
                    <ListItemButton
                      sx={{ pl: 4 }}
                      key={child.id}
                      onClick={() => router.push(child.url)}
                    >
                      <ListItemIcon>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.name} />
                    </ListItemButton>
                  ))}
                </Collapse>
              </>
            ) : (
              <ListItemButton
                key={menu.id}
                onClick={() => router.push(menu.url)}
              >
                <ListItemIcon>
                  <ListItemIcon>{menu.icon}</ListItemIcon>
                  <ListItemText primary={menu.name} />
                </ListItemIcon>
              </ListItemButton>
            )}
          </React.Fragment>
        ))}
      </List>
      <Divider />
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: [1],
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
    </Drawer>
  );
}
