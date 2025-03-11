// import { use, useContext } from "react";
// import { ChatContext } from "../context/ChatContext";
// import { Container, Stack } from "react-bootstrap";
// import UserChat from "../components/chat/UserChat";
// import { AuthContext } from "../context/AuthContext";

// const Chat = () => {
//   const { user } = useContext(AuthContext);
//   const { userChats, isUserChatsLoading, userChatsError } =
//     useContext(ChatContext);

//   console.log("UserChats", userChats);

//   return (
//     <Container>
//       {userChats?.length < 1 ? (<p>No chats Available.</p>) : (
//         <Stack direction="horizontal" gap={4} className="align-items-start">
//           <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
//             {isUserChatsLoading && <p>Loading Chats...</p>}
//             {userChatsError && <p>Error loading chats: {userChatsError.message}</p>}
//             {userChats.map((chat, index) => {
//               return (
//                 <div key={index}>
//                   <UserChat chat={chat} user={user} />
//                 </div>
//               );
//             })}
//           </Stack>
//           <p>ChatBox</p>
//         </Stack>
//       )}
//     </Container>
//   );
// };

// export default Chat;


import { useContext } from "react"; // Corrected 'use' to 'useContext'
import { ChatContext } from "../context/ChatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import PotentialChats from "../components/chat/PotentialChats";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, userChatsError } = useContext(ChatContext);

  //console.log("UserChats", userChats);

  // Default userChats to an empty array if null or undefined
  const chats = userChats || [];

  return (
    <Container>
        <PotentialChats />
      {chats.length === 0 ? (
        isUserChatsLoading ? (
          <p>Loading Chats...</p>
        ) : userChatsError ? (
          <p>Error loading chats: {userChatsError.message}</p>
        ) : (
          <p>No chats available.</p>
        )
      ) : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            {chats.map((chat, index) => (
              <div key={index}>
                <UserChat chat={chat} user={user} />
              </div>
            ))}
          </Stack>
          <p>ChatBox</p>
        </Stack>
      )}
    </Container>
  );
};

export default Chat;
