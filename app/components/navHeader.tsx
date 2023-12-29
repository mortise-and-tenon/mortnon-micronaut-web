import { Layout, Menu, MenuProps, Avatar } from "antd";
import { UserOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";

import Image from "next/image";
import Link from "next/link";

const { Header} = Layout;

const menuItems: MenuProps = [
  {
    key: "dashboard",
    label: <Link href="/">首页</Link>,
    icon: <HomeOutlined />,
  },
  {
    key: "sys",
    label: <Link href="/user">系统管理</Link>,
    icon: <SettingOutlined />,
  },
];

export default function NavHeader() {
  return (
    <Header className="main-header">
      <Image src="/clover.png" alt="Logo" width={48} height={48} />
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["sys"]}
        items={menuItems}
        style={{ flex: 1, minWidth: 0 }}
      />
      <Avatar icon={<UserOutlined />} />
    </Header>
  );
}
