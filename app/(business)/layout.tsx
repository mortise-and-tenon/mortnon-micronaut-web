"use client";
import { Layout } from "@douyinfe/semi-ui";

import NavHeader from "@/app/_modules/navHeader";
import NavSider from "@/app/_modules/navSider";

const { Content } = Layout;

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className="layout-almost-full-screen">
      <NavHeader selectedKey="system" />
      <Content className="content">
        <NavSider />
        {children}
      </Content>
    </Layout>
  );
}
