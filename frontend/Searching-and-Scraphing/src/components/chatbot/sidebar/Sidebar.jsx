import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { FiMessageSquare, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  TbLayoutSidebarRightCollapseFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Sidebar = ({ onNewChat, onSelectChat, SelectedChat }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingChat, setEditingChat] = useState(null);
  const [editedName, setEditedName] = useState("");

  const [chats, setChats] = useState({
    today: [],
    yesterday: [],
    last7Days: [],
  });
  const [sessions, setSessions] = useState([]);
  const [activeselectedChat, setactiveSelectedChat] = useState();
  console.log(
    "this is what I am getting for selected chat ",
    activeselectedChat
  );
  useEffect(() => {
    const fetchSessions = async (user_id) => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/sessions/",
          {
            params: { user_id },
          }
        );
        // console.log("Sessions :", response.data);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions(5);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0)); // Start of today
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1); // Yesterday's date
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7); // 7 days ago

      let todayChats = [];
      let yesterdayChats = [];
      let last7DaysChats = [];

      sessions.forEach((session) => {
        const chatDate = new Date(session.created_at);
        const chatName = session.session_name;
        const chatId = session.id;

        if (chatDate >= today) {
          todayChats.push({ name: chatName, id: chatId });
        } else if (chatDate >= yesterday && chatDate < today) {
          yesterdayChats.push({ name: chatName, id: chatId });
        } else {
          last7DaysChats.push({ name: chatName, id: chatId });
        }
      });

      setChats({
        today: todayChats,
        yesterday: yesterdayChats,
        last7Days: last7DaysChats,
      });
    }
  }, [sessions]);

  // console.log("This is Chat :", chats)

  const showToast = (message, type = "success") => {
    const toastOptions = {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      toastId: message, // Prevent duplicate toasts with the same message
    };

    if (type === "success") {
      toast.success(message, toastOptions);
    } else if (type === "error") {
      toast.error(message, toastOptions);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.body.classList.toggle("sidebar-closed");
  };

  const handleDelete = async (section, index, e, id) => {
    e.stopPropagation(); // Prevents event from propagating

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/sessions/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the chat session");
      }

      const chatName = chats[section][index];

      // Remove the deleted chat from state
      setChats((prev) => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      }));

      showToast(`Deleted chat: ${chatName}`);
    } catch (error) {
      console.error("Error deleting chat:", error);
      showToast("Failed to delete chat. Please try again.");
    }
  };

  const startRename = (section, index, currentName, e, id) => {
    e.stopPropagation();
    setEditingChat(`${section}-${index}`);
    setEditedName(currentName);
  };

  const handleRename = async (section, index, e, id) => {
    console.log("handleRename called with Id ", id);
    e.preventDefault();

    if (editedName.trim()) {
      try {
        // Send PATCH request to update session name
        const response = await axios.patch(
          `http://127.0.0.1:8000/api/sessions/${id}/`,
          {
            session_name: editedName,
          }
        );

        if (response.status === 200) {
          setChats((prevChats) => {
            const updatedChats = {
              ...prevChats,
              [section]: prevChats[section].map((chat, i) =>
                i === index ? { ...chat, name: editedName } : chat
              ),
            };
            return updatedChats;
          });

          setEditingChat(null);
          setEditedName("");
          showToast(`Renamed chat successfully!`);
        } else {
          showToast(`Failed to rename chat.`, "error");
        }
      } catch (error) {
        console.error("Error renaming session:", error);
        showToast("Failed to rename chat. Please try again.", "error");
      }
    }
  };
  const CreateNewChatAPIcall = async (user_id, session_name) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/sessions/", {
        user_id: user_id,
        session_name: session_name,
      });
      console.log("Response :", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const CreateNewChat = () => {
    navigate("/chats/newchat");
    let Response = CreateNewChatAPIcall(5, "Call from API");
    const newChat = Response.session_name;
    setChats((prevChats) => ({
      ...prevChats, // Spread the existing chats object
      today: [...prevChats.today, newChat], // Add the new chat to the 'today' array
    }));
  };

  const renderChatItem = (chat, index, section, id) => {
    const isEditing = editingChat === `${section}-${index}`;

    if (isEditing) {
      return (
        <li key={index} className="chat-item editing">
          <form
            onSubmit={(e) => handleRename(section, index, e, id)}
            className="rename-form"
          >
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              autoFocus
              onBlur={(e) => handleRename(section, index, e, id)}
              className="rename-input"
              placeholder="Enter new name..."
            />
          </form>
        </li>
      );
    }

    return (
      <li
        key={index}
        className="chat-item"
        onClick={() => navigate(`/chats/${chat}`)}
      >
        <div className="chat-item-content">
          <FiMessageSquare className="chat-icon" />
          <span className="chat-name">{chat}</span>
        </div>
        {isSidebarOpen && (
          <div className="chat-actions">
            <button
              className="action-btn rename-btn"
              onClick={(e) => startRename(section, index, chat, e, id)}
              title="Rename chat"
            >
              <FiEdit2 />
            </button>
            <button
              className="action-btn delete-btn"
              onClick={(e) => handleDelete(section, index, e, id)}
              title="Delete chat"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {isSidebarOpen && (
            <div className="logo-text">
              <img
                style={{ width: "80px", height: "80px" }}
                src="./chats/2_FINAL_SEE_HEAR_SPEAK_IN_COLOR_ORIGINAL_COLOR.svg"
                alt=""
              />
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <TbLayoutSidebarLeftCollapseFilled />
          ) : (
            <TbLayoutSidebarRightCollapseFilled />
          )}
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <FiPlus className="btn-icon" />
        {isSidebarOpen && <span onClick={CreateNewChat}> New Chat</span>}
      </button>

      <div className="sidebar-scroll">
        {isSidebarOpen && (
          <>
            <div className="sidebar-section">
              {chats.today.length > 0 && <h3>Today</h3>}
              <ul className="chat-list">
                {chats.today.map((chat, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      SelectedChat(chat.name, chat.id);
                    }}
                  >
                    {renderChatItem(chat.name, index, "today", chat.id)}
                  </div>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              {chats.yesterday.length > 0 && <h3>Yesterday</h3>}
              <ul className="chat-list">
                {chats.yesterday.map((chat, index) =>
                  renderChatItem(chat.name, index, "yesterday",chat.id)
                )}
              </ul>
            </div>

            <div className="sidebar-section">
            {chats.last7Days.length > 0 && <h3>Last 7 Days</h3>}
              <ul className="chat-list">
                {chats.last7Days.map((chat, index) =>
                  renderChatItem(chat.name, index, "last7Days",chat.id)
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
