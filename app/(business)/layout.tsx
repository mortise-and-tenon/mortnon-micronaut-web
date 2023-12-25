import React from "react";
import type { Metadata } from "next";
import { Breadcrumb, Layout, Menu, theme, MenuProps } from "antd";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

const items1: MenuProps["items"] = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2: MenuProps["items"] = [
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,

    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

export const metadata: Metadata = {
  title: "(business)Mortnon Web",
  description: "Mortnon Web",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
