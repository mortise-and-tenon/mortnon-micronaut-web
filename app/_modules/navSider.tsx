import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Nav, Skeleton } from "@douyinfe/semi-ui";
import {
  IconUser,
  IconUserGroup,
  IconLayers,
  IconMenu,
  IconFile,
  IconArticle,
} from "@douyinfe/semi-icons";
import { useRouter, usePathname } from "next/navigation";
import "./style.css";

export type MenuItem = {
  itemKey: string;
  text: string;
  icon: ReactNode;
  items: Array<MenuItem>;
};

export type MenuLinkMap = {
  [key: string]: string;
};

export async function getMenu(
  setMenus: React.Dispatch<React.SetStateAction<MenuItem[]>>,
  setMenuLinks: React.Dispatch<React.SetStateAction<MenuLinkMap>>,
  setSkeletonLoading: React.Dispatch<React.SetStateAction<boolean>>,
  changeMenu
) {
  try {
    const response = await fetch("/api/menus");
    if (response.ok) {
      const body = await response.json();
      console.log("menu", body);
      const menuArray: Array<MenuItem> = new Array<MenuItem>();
      const menuLinkMap: MenuLinkMap = {};
      body.data.forEach((menuData) => {
        const menu: MenuItem = {
          itemKey: menuData.id.toString(),
          text: menuData.name,
          icon: renderIcon(menuData.icon),
          items: [],
        };
        //TODO:判断当前用户是否有相应菜单权限，有权限的才做展示
        //menuData.permission

        //递归处理子菜单
        convertMenuNode(menu, menuData.children_menu);

        menuArray.push(menu);
        menuLinkMap[menuData.id.toString()] = menuData.url;
      });

      setMenus(menuArray);
      console.log("items:", menuArray);
      console.log("link:", menuLinkMap);

      setMenuLinks(menuLinkMap);
      changeMenu(menuLinkMap);
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
  IconUser: IconUser,
  IconUserGroup: IconUserGroup,
  IconLayers: IconLayers,
  IconMenu: IconMenu,
  IconFile: IconFile,
};

function renderIcon(icon: string) {
  switch (icon) {
    case "IconUser":
      return <IconUser />;
    case "IconUserGroup":
      return <IconUserGroup />;
    case "IconLayers":
      return <IconLayers />;
    case "IconMenu":
      return <IconMenu />;
    case "IconFile":
      return <IconFile />;
    default:
      return <IconArticle />;
  }
}

const convertMenuNode = (parentMenu: MenuItem, children) => {
  if (children.length == 0) {
    return;
  }

  const childrenMenu: Array<MenuItem> = new Array<MenuItem>();
  children.forEach((child) => {
    const menu: MenuItem = {
      itemKey: child.id.toString(),
      text: child.name,
      icon: renderIcon(child.icon),
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
  const [menus, setMenus] = useState([] as Array<MenuItem>);
  //菜单链接数据
  const [menuLinkMap, setMenuLinkMap] = useState({} as MenuLinkMap);

  const placeholder = (
    <div>
      <Skeleton.Title style={{ width: 240, marginTop: 10 }} />
      <Skeleton.Title style={{ width: 240, marginTop: 10 }} />
      <Skeleton.Title style={{ width: 240, marginTop: 10 }} />
    </div>
  );

  const [loading, setSkeletonLoading] = useState(true);

  const [selectedKey, setSelectedKey] = useState([]);

  const changeMenu = (menuLinkMapData: MenuLinkMap) => {
    for (let [key, value] of Object.entries(menuLinkMapData)) {
      if (value === pathname) {
        setSelectedKey([key]);
      }
    }
  };

  useEffect(() => {
    getMenu(setMenus, setMenuLinkMap, setSkeletonLoading, changeMenu);
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  return (
    <Skeleton placeholder={placeholder} loading={loading} active>
      <Nav
        items={menus}
        defaultSelectedKeys={["1"]}
        selectedKeys={selectedKey}
        footer={{
          collapseButton: true,
        }}
        onSelect={(data) => {
          setSelectedKey([data.itemKey.toString()]);
          router.push(menuLinkMap[data.itemKey]);
        }}
      />
    </Skeleton>
  );
}
