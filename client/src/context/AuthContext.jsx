import { createContext, useCallback, useEffect, useState } from "react";
import { postRequest, baseUrl } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setisRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  console.log("User", user);

  useEffect(() => {
    const user = localStorage.getItem("User");
    setUser(JSON.parse(user));

  },[]);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();

      setisRegisterLoading(true);
      setRegisterError(null);

      const responce = await postRequest(
        `${baseUrl}/users/register`,
        JSON.stringify(registerInfo)
      );

      setisRegisterLoading(false);

      if (responce.error) {
        return setRegisterError(responce);
      }
      localStorage.setItem("User", JSON.stringify(responce));
      setUser(responce);
    },
    [registerInfo]
  );

  const loginUser = useCallback()

  const logoutUser = useCallback(()=>{
    localStorage.removeItem(user);
    setUser(null);

  },[]);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerError,
        registerUser,
        isRegisterLoading,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
