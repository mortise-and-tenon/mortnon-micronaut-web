"use client";

import { Layout,Nav } from "@douyinfe/semi-ui";


import "./style.css";
import NavHeader from "./_modules/navHeader";

const { Footer, Content } = Layout;

export default function Home() {
  return (
    <Layout className="layout">
      <NavHeader selectedKey="home"/>
      <Content>
 content
      </Content>
      <Footer>footer</Footer>
    </Layout>
  );
}
