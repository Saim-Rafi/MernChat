import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import avatar from "../../assets/avatar.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const { onlineUsers, notification } = useContext(ChatContext);

  const unreadNotifications = unreadNotificationsFunc(notification);
  const thisUserNotification = unreadNotifications?.filter(
    (n) => n.senderId === recipientUser?._id
  );

  const isOnline = onlineUsers?.some(
    (user) => user?.userId === recipientUser?._id
  );

  //console.log(recipientUser);

  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="user-card  align-items-center p-2 justify-content-between"
      role="button"
    >
      <div className="d-flex">
        <div className="me-2">
          <img src={avatar} alt="avatar" height="35px " />
        </div>
        <div className="text-content">
          <div className="name">{recipientUser?.name}</div>
          <div className="text">Text message</div>
        </div>
      </div>
      <div className="d-flex flec-column align-items-end">
        <div className="date">12/12/2004</div>
        <div
          className={
            thisUserNotification?.length > 0 ? "this-user-notifications" : ""
          }
        >
          {thisUserNotification?.length > 0 ? thisUserNotification?.length : ""}
        </div>
        <span className={isOnline ? "user-online" : " "}></span>
      </div>
    </Stack>
  );
};

export default UserChat;
