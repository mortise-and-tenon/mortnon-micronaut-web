import { AntdRegistry } from "@ant-design/nextjs-registry";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import type { Metadata } from "next";
import "./normalize.css";
import { GlobalProvider } from "./_modules/globalProvider";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export const metadata: Metadata = {
  title: "MorTnon 后台管理系统",
  description: "MorTnon 后台管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <AntdRegistry>{children}</AntdRegistry>
        </GlobalProvider>
      </body>
    </html>
  );
}
