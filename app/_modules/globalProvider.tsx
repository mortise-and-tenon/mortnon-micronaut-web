"use client";

import React, {
  createContext, Dispatch, SetStateAction,
  useState
} from "react";

type GlobalContextType = {
  globalPermission: Array<string>;
  setGlobalPermission: Dispatch<SetStateAction<Array<string>>>;
};

// 全局的用户权限值
export const GlobalContext = createContext<GlobalContextType>({
  globalPermission: [],
  setGlobalPermission: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalPermission, setGlobalPermission] = useState([] as Array<string>);

  return (
    <GlobalContext.Provider value={{ globalPermission, setGlobalPermission }}>
      {children}
    </GlobalContext.Provider>
  );
};
