'use client';
import Image from "next/image";
import { Layout } from "@douyinfe/semi-ui";
import './style.css'

const { Header, Footer, Content } = Layout;

export default function Login(){
    return(
        <Layout className="layout-almost-full-screen background-style">
            <Header className="header-style">
                <Image src="/clover.png" alt="Logo" width={50} height={50}/>
                <h1 className="title-style">Monrton 管理系统</h1></Header>
            <Content>content</Content>
            <Footer>footer</Footer>
        </Layout>
    )
}