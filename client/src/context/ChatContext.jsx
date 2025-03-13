import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  use,
} from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState([]);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);

      if (response.error) {
        return console.log("Error fetching users", response);
      }

      const pChats = response.filter((u) => {
        let isChatCreated = false;
        if (user?._id === u._id) return false;

        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === u._id || chat.members[1] === u._id;
          });
        }

        return !isChatCreated;
      });

      setPotentialChats(pChats);
    };
    getUsers();
  }, [userChats]);

  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true);
        setUserChatsError(null);
        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
        setIsUserChatsLoading(false);
        if (response?.error) {
          return setUserChatsError(response);
        }
        setUserChats(response);
      }
    };
    getUserChats();
  }, [user]);

  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      setMessagesError(null);
      const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);
      setIsMessagesLoading(false);
      if (response?.error) {
        return setMessagesError(response);
      }
      setMessages(response);
    };
    getMessages();
  }, [currentChat]);


  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({ firstId, secondId })
    );

    if (response.error) {
      return console.log("Error creating chat", response);
    }
    setUserChats((prev) => [...prev, response]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// import { createContext, useState, useEffect, useContext } from "react";
// import { baseUrl, getRequest } from "../utils/services";
// import { AuthContext } from "./AuthContext";

// export const ChatContext = createContext();

// export const ChatContextProvider = ({ children }) => {
//   const { user } = useContext(AuthContext); // Get user from AuthContext
//   const [userChats, setUserChats] = useState([]); // Initialize as empty array
//   const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
//   const [userChatsError, setUserChatsError] = useState(null);

//   useEffect(() => {
//     const getUserChats = async () => {
//       if (!user?._id) {
//         setUserChats([]); // Default to empty array if no user
//         return;
//       }

//       setIsUserChatsLoading(true);
//       setUserChatsError(null);

//       try {
//         const response = await getRequest(`${baseUrl}/chats/${user._id}`);
//         if (response?.error) {
//           setUserChatsError(response);
//           setUserChats([]); // Default to empty array on error
//         } else {
//           // Ensure response is an array, or transform it if needed
//           setUserChats(Array.isArray(response) ? response : []);
//         }
//       } catch (error) {
//         setUserChatsError({ error: true, message: error.message });
//         setUserChats([]); // Default to empty array on network error
//       } finally {
//         setIsUserChatsLoading(false);
//       }
//     };

//     getUserChats();
//   }, [user]); // Re-run when user changes

//   return (
//     <ChatContext.Provider
//       value={{ userChats, isUserChatsLoading, userChatsError }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };
