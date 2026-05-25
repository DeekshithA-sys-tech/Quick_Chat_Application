
import { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // function to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages((prev) => ({
          ...prev,
          ...data.unseenMessages
        }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get all groups the user is member of
  const getGroups = async () => {
    try {
      const { data } = await axios.get("/api/messages/groups/all");
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to create a new group
  const createGroup = async (groupData) => {
    try {
      const { data } = await axios.post("/api/messages/groups", groupData);
      if (data.success) {
        setGroups((prev) => [...prev, data.group]);
        toast.success(data.message);
        return data.group;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to update group details
  const updateGroup = async (groupId, groupData) => {
    try {
      const { data } = await axios.put(`/api/messages/groups/${groupId}`, groupData);
      if (data.success) {
        setGroups((prev) => prev.map((g) => (g._id === groupId ? data.group : g)));
        if (selectedUser && selectedUser._id === groupId) {
          setSelectedUser(data.group);
        }
        toast.success(data.message);
        return data.group;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get messages for selected user or group
  const getMessages = async (id) => {
    try {
      const isGroupChat = groups.some((g) => g._id === id) || (selectedUser?._id === id && selectedUser?.isGroup);
      const url = isGroupChat ? `/api/messages/group/${id}` : `/api/messages/${id}`;
      const { data } = await axios.get(url);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to send message to selected user or group
  const sendMessage = async (messageData) => {
    try {
      const isGroupChat = selectedUser?.isGroup;
      const url = isGroupChat ? `/api/messages/group/send/${selectedUser._id}` : `/api/messages/send/${selectedUser._id}`;
      const { data } = await axios.post(url, messageData);
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messages for selected user or group
  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isCurrentChat = selectedUser && (
        (!selectedUser.isGroup && !newMessage.groupId && newMessage.senderId === selectedUser._id) ||
        (selectedUser.isGroup && newMessage.groupId === selectedUser._id)
      );

      if (isCurrentChat) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        if (!selectedUser.isGroup) {
          axios.put(`/api/messages/mark/${newMessage._id}`);
        }
      } else {
        const key = newMessage.groupId || newMessage.senderId;
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [key]: prevUnseenMessages[key] ? prevUnseenMessages[key] + 1 : 1,
        }));
      }
    });
  };

  // function to unsubscribe from messages
  const unsubscribeToMessages = async () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    groups,
    selectedUser,
    getUsers,
    getGroups,
    createGroup,
    updateGroup,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
