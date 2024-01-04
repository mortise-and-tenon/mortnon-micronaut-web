import { useEffect, useState } from "react";
import { Button } from "@douyinfe/semi-ui";

const cancelText = "取消";
const confirmText = "确定";

export default function ModalFooter(props) {
  let { cancelBtnProps, confirmBtnProps, cancelOnClick, confirmOnClick } =
    props;

  return (
    <div className="semi-modal-footer" x-semi-prop="footer">
      <Button
        theme="light"
        type="tertiary"
        {...cancelBtnProps}
        onClick={cancelOnClick}
      >
        {cancelText}
      </Button>
      <Button
        theme="solid"
        type="primary"
        {...confirmBtnProps}
        onClick={confirmOnClick}
      >
        {confirmText}
      </Button>
    </div>
  );
}
