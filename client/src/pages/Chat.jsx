import { use, useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {

    const {userChats, isUserChatsLoading, userChatsError} = useContext(ChatContext);
    console.log("UserChats", userChats);
    return (  <>Chat App</> );
}
 
export default Chat;