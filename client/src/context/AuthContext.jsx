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
  const [loginError, setLoginError] = useState(null);
  const [isLoginLoading, setisLoginLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  console.log("User", user);
  console.log("loginInfo",loginInfo);

  useEffect(() => {
    const user = localStorage.getItem("User");
    setUser(JSON.parse(user));
  }, []);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);
  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();

      setisRegisterLoading(true);
      setRegisterError(null);

      const response = await postRequest(
        `${baseUrl}/users/register`,
        JSON.stringify(registerInfo)
      );

      setisRegisterLoading(false);

      if (response.error) {
        return setRegisterError(response);
      }
      localStorage.setItem("User", JSON.stringify(response));
      setUser(response);
    },
    [registerInfo]
  );

  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate loginInfo before sending the request
      const { email, password } = loginInfo;
      if (!email.trim() || !password.trim()) {
        setLoginError({ error: true, message: "Email and password are required and cannot be empty." });
        setisLoginLoading(false);
        return;
      }

      // Additional validation for email format (optional)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLoginError({ error: true, message: "Please enter a valid email address." });
        setisLoginLoading(false);
        return;
      }

      setisLoginLoading(true);
      setLoginError(null);
      const responce = await postRequest(
        `${baseUrl}/users/login`,
        JSON.stringify(loginInfo)
      );
      setisLoginLoading(false);

      if (responce.error) {
        return setLoginError(responce);
      }

      localStorage.setItem("User", JSON.stringify(responce));
      setUser(responce);
    },
    [loginInfo]
  );

  const logoutUser = useCallback(() => {
    localStorage.removeItem(user);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerError,
        registerUser,
        isRegisterLoading,
        logoutUser,
        loginUser,
        loginError,
        loginInfo,
        updateLoginInfo,
        isLoginLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
