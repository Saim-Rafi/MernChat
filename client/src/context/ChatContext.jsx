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
import { io } from "socket.io-client";

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
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notification, setNotification] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  console.log("notification", notification);

  //intial socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  //add online users
  useEffect(() => {
    if (socket === null) return;
    socket.emit("addNewUser", user?._id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  //send Message
  useEffect(() => {
    if (socket === null) return;

    const recipientId = currentChat?.members?.find((id) => id !== user?._id);

    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);

  //receive message and notification
  useEffect(() => {
    if (socket === null) return;
    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) return;
      setMessages((prev) => [...prev, res]);
    });
    socket.on("getNotification", (res) => {
      const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

      if (isChatOpen) {
        setNotification((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotification((prev) => [res, ...prev]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

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
      setAllUsers(response);
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
  }, [user, notification]);

  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      setMessagesError(null);
      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?._id}`
      );
      setIsMessagesLoading(false);
      if (response?.error) {
        return setMessagesError(response);
      }
      setMessages(response);
    };
    getMessages();
  }, [currentChat]);

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMesage) => {
      if (!textMessage) return console.log("You must type some message...");
      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
        })
      );

      if (response.error) {
        return setSendTextMessageError(response);
      }
      setNewMessage(response);
      setMessages((prev) => [...prev, response]);
      setTextMesage("");
    },
    []
  );

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

  const markAllNotificationsAsRead = useCallback((notification) => {
    const mNotifications = notification.map((n) => {
      return { ...n, isRead: true };
    });

    setNotification(mNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (n, userChats, user, notification) => {
      //find chat to open

      const desiredChat = userChats.find((chat) => {
        const chatMembers = [user._id, n.senderId];
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member);
        });

        return isDesiredChat;
      });

      //mark notification as read
      const mNotifications = notification.map((el) => {
        if (n.senderId == el.senderId) {
          return { ...n, isRead: true };
        } else {
          return el;
        }
      });

      updateCurrentChat(desiredChat);
      setNotification(mNotifications);
    },
    []
  );

  // const markThisUserNotificationAsRead = useCallback(
  //   (thisUserNotification, notification) => {
  //     //mark notifications as read

  //     const mNotifications = notification.map((el) => {
  //       let notifications;

  //       thisUserNotification.forEach((n) => {
  //         if (n.senderId === el.senderId) {
  //           notifications = { ...n, isRead: true };
  //         } else {
  //           notifications = el;
  //         }
  //       });

  //       return notifications;
  //     });

  //     setNotification(mNotifications);
  //   },
  //   []
  // );

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
        sendTextMessage,
        onlineUsers,
        notification,
        allUsers,
        markAllNotificationsAsRead,
        //markNotificationAsRead,
        //markThisUserNotificationAsRead,
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
