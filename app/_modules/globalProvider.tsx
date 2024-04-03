"use client";

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

type GlobalContextType = {
  globalPermission: Array<string>;
  setGlobalPermission: Dispatch<SetStateAction<Array<string>>>;
  profile: any;
  setProfile: Dispatch<SetStateAction<any>>;
};

// 全局的用户权限值
export const GlobalContext = createContext<GlobalContextType>({
  globalPermission: [],
  setGlobalPermission: () => {},
  profile: undefined,
  setProfile: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalPermission, setGlobalPermission] = useState([] as Array<string>);
  const [profile, setProfile] = useState(undefined as any);

  return (
    <GlobalContext.Provider
      value={{ globalPermission, setGlobalPermission, profile, setProfile }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
