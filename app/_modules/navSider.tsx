import { useMemo } from "react";
import { Nav } from "@douyinfe/semi-ui";
import {
  IconUser,
  IconUserGroup,
  IconLayers,
  IconMenu,
  IconFile,
} from "@douyinfe/semi-icons";
import { useRouter } from "next/navigation";

export async function menu() {
  try {
    const response = await fetch("/api/menus");
    response.json();
  } catch (error) {}
}

export default function NavSider(props) {
  const { selectedKey } = props;
  const selectedKeys = [selectedKey];
  const items = useMemo(
    () => [
      { itemKey: "user", text: "用户管理", icon: <IconUser /> },
      { itemKey: "role", text: "角色管理", icon: <IconUserGroup /> },
      { itemKey: "org", text: "组织管理", icon: <IconLayers /> },
      { itemKey: "menu", text: "菜单管理", icon: <IconMenu /> },
      { itemKey: "log", text: "日志管理", icon: <IconFile /> },
    ],
    []
  );

  const menuLinkMap = {
    user: "/user",
    role: "/role",
    org: "/org",
    menu: "/menu",
    log: "/log",
  };

  const router = useRouter();

  return (
    <Nav
      className="nav-menu"
      items={items}
      defaultSelectedKeys={selectedKeys}
      footer={{
        collapseButton: true,
      }}
      onSelect={(data) => router.push(menuLinkMap[data.itemKey])}
    />
  );
}
