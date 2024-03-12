import { Flex } from "antd";

import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Forbidden() {
  return (
    <Flex align="center"  style={{ height: "100vh" }} vertical>
      <div>
        <FontAwesomeIcon icon={faBan} style={{fontSize:64,marginBottom:16,color: "#FF4D26"}}/>
      </div>
      <span>无权限访问该页面，请刷新后重试</span>
    </Flex>
  );
}
