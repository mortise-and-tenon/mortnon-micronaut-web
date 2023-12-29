import { useMemo } from "react";
import Image from "next/image";
import { Nav, Dropdown, Avatar } from "@douyinfe/semi-ui";
import { IconHome, IconDesktop } from "@douyinfe/semi-icons";
import { useRouter } from "next/navigation";
import './style.css'

export default function NavHeader(props) {
  const {selectedKey} = props;
  const selectedKeys = [selectedKey];
  const items = useMemo(
    () => [
      { itemKey: "home", text: "首页", icon: <IconHome /> },
      { itemKey: "system", text: "系统管理", icon: <IconDesktop /> },
    ],
    []
  );

  const menuLinkMap = {
    home: '/',
    system: '/user'
  };

  const router = useRouter();

  return (
    <Nav
      mode="horizontal"
      header={{
        logo: <Image src="/clover.png" alt="Logo" width={50} height={50} />,
        text: "Mortnon 管理平台",
      }}
      items={items}
      selectedKeys={selectedKeys}
      footer={
        <Dropdown
          position="bottomRight"
          render={
            <Dropdown.Menu>
              <Dropdown.Item>用户详情</Dropdown.Item>
              <Dropdown.Item>退出登录</Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Avatar size="small" color="light-blue" style={{ margin: 4 }}>
            BD
          </Avatar>
        </Dropdown>
      }
      onSelect={(data) => router.push(menuLinkMap[data.itemKey])}
    ></Nav>
  );
}
