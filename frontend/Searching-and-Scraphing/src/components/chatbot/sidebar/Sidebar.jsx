import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { FiMessageSquare, FiPlus, FiEdit2, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarRightExpand } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { HashLoader } from "react-spinners";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const user_id = 1;

const Sidebar = ({ onNewChat, onSelectChat, SelectedChat, initialSelectedId, isVisible }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingChat, setEditingChat] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const [chats, setChats] = useState({
    today: [],
    yesterday: [],
    last7Days: [],
  });
  const [sessions, setSessions] = useState([]);
  const [activeselectedChat, setactiveSelectedChat] = useState();
  const [selectedChatId, setSelectedChatId] = useState(() => {
    // Initialize from props or localStorage
    return initialSelectedId || parseInt(localStorage.getItem('selectedChatId')) || null;
  });

  useEffect(() => {
    const fetchSessions = async (user_id) => {
      setIsLoading(true);
      // const delay = 3000; // 3 seconds delay
      try {
        // Add artificial delay using Promise
        // await new Promise(resolve => setTimeout(resolve, delay));
        
        const response = await axios.get(
          `${BASE_URL}/api/sessions/`,
          {
            params: { user_id },
          }
        );
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions(user_id);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

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

      // Sort each array by ID in descending order
      todayChats.sort((a, b) => b.id - a.id);
      yesterdayChats.sort((a, b) => b.id - a.id);
      last7DaysChats.sort((a, b) => b.id - a.id);

      setChats({
        today: todayChats,
        yesterday: yesterdayChats,
        last7Days: last7DaysChats,
      });
    }
  }, [sessions]);

  // Add this useEffect to handle initial selection
  useEffect(() => {
    if (selectedChatId && chats.today.length > 0) {
      // Find the chat in all sections
      const findChatById = (id) => {
        for (const section of ['today', 'yesterday', 'last7Days']) {
          const chat = chats[section].find(c => c.id === id);
          if (chat) return chat;
        }
        return null;
      };

      const selectedChat = findChatById(selectedChatId);
      if (selectedChat) {
        // Update the selection visually
        setSelectedChatId(selectedChat.id);
      }
    }
  }, [chats, selectedChatId]);

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
    e.stopPropagation();

    // Prevent multiple delete confirmations
    if (isDeleteConfirmationOpen) {
      return;
    }

    setIsDeleteConfirmationOpen(true);
    
    // Store the toast ID for proper dismissal
    let confirmToastId = null;

    const handleCancel = () => {
        setIsDeleteConfirmationOpen(false);
        toast.dismiss(confirmToastId);
    };

    const handleConfirmDelete = async () => {
        // First dismiss the confirmation dialog
        setIsDeleteConfirmationOpen(false);
        toast.dismiss(confirmToastId);
        
        try {
            const response = await fetch(
                `${BASE_URL}/api/sessions/${id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete the chat session");
            }

            const chatName = chats[section][index].name;

            // Remove the deleted chat from state
            setChats((prev) => ({
                ...prev,
                [section]: prev[section].filter((_, i) => i !== index),
            }));

            // Show success notification
            toast.success(
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <p style={{ fontSize: '14px', marginBottom: '2px' }}>Successfully Deleted "{chatName}"</p>
                </div>,
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: {
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: '#fff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                        padding: '16px',
                    }
                }
            );
           setTimeout(() => {
            navigate('/');
           }, 3000);


        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiTrash2 size={16} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', marginBottom: '2px' }}>Delete Failed</p>
                        <p style={{ fontSize: '12px', opacity: 0.8 }}>Please try again later</p>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: {
                        background: 'linear-gradient(135deg, #dc3545, #ff4757)',
                        color: '#fff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                        padding: '16px',
                    },
                    onClose: () => setIsDeleteConfirmationOpen(false)
                }
            );
        }
    };

    // Create the confirmation dialog
    confirmToastId = toast.warn(
        <div className="delete-confirmation">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '10px 0'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #ff6b6b22, #ff8e5322)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px'
                }}>
                    <FiTrash2 size={28} style={{ color: '#ff6b6b' }} />
                </div>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '10px',
                    background: 'linear-gradient(135deg, #1a1a2e, #2a3f5f)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Delete Confirmation
                </h3>
                <p style={{
                    fontSize: '15px',
                    color: '#1a1a2e',
                    marginBottom: '8px',
                    fontWeight: '500'
                }}>
                    Are you sure you want to delete this chat?
                </p>
                <p style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '20px',
                }}>
                    This action will permanently delete all messages and cannot be undone.
                </p>
            </div>
            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '5px'
            }}>
                <button
                    onClick={handleCancel}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        background: 'white',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirmDelete}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.25)',
                    }}
                >
                    <FiTrash2 size={16} />
                    Delete
                </button>
            </div>
        </div>,
        {
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            closeButton: false,
            style: {
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                padding: '24px',
                minWidth: '360px',
            },
            onClose: () => setIsDeleteConfirmationOpen(false)
        }
    );
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
          `${BASE_URL}/api/sessions/${id}/`,
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
          showToast(`Renamed chat from ${chats[section][index].name} -> ${editedName}`, "success");
          setTimeout(() => {
            navigate(`/chats/${encodeURIComponent(editedName)}`);
          }, 2500);
          
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
      const response = await axios.post(`${BASE_URL}/api/sessions/`, {
        user_id: user_id,
        session_name: session_name,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const CreateNewChat = async () => {
    try {
      // Create a temporary ID and add the chat immediately for instant feedback
      const tempId = Date.now();
      const tempChat = { name: "New Chat", id: tempId };
      
      // Optimistically update the UI
      setChats((prevChats) => ({
        ...prevChats,
        today: [tempChat, ...prevChats.today],
      }));

      // Update selection immediately
      setSelectedChatId(tempId);
      localStorage.setItem('selectedChatId', tempId);
      localStorage.setItem('selectedChatName', "New Chat");
      SelectedChat("New Chat", tempId);

      // Navigate immediately
      navigate(`/chats/${encodeURIComponent("New Chat")}`);

      // Make the API call in the background
      const Response = await CreateNewChatAPIcall(user_id, "New Chat");
  
      if (!Response || !Response.session_name) {
        // If API call fails, revert the changes
        setChats((prevChats) => ({
          ...prevChats,
          today: prevChats.today.filter(chat => chat.id !== tempId)
        }));
        console.error("API call failed or returned invalid data:", Response);
        toast.error("Failed to create new chat. Please try again.");
        return;
      }
  
      // Update the temporary chat with real data
      const newChat = Response.session_name;
      const newChatId = Response.id;
  
      setChats((prevChats) => ({
        ...prevChats,
        today: [
          { name: newChat, id: newChatId },
          ...prevChats.today.filter(chat => chat.id !== tempId)
        ],
      }));

      // Update selection with real ID
      setSelectedChatId(newChatId);
      localStorage.setItem('selectedChatId', newChatId);
      localStorage.setItem('selectedChatName', newChat);
      SelectedChat(newChat, newChatId);
  
      // Update URL with real chat name
      navigate(`/chats/${encodeURIComponent(newChat)}`);
  
    } catch (error) {
      console.error("Error in CreateNewChat:", error);
      toast.error("Failed to create new chat. Please try again.");
    }
  };
  const renderChatItem = (chat, index, section, id) => {
    const isEditing = editingChat === `${section}-${index}`;
    const isSelected = selectedChatId === id;

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
        className={`chat-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          setSelectedChatId(id);
          handleChatSelection(chat.name, id);
          navigate(`/chats/${encodeURIComponent(chat.name)}`);
        }}
      >
        <div className="chat-item-content">
          <FiMessageSquare className="chat-icon" />
          <span className="chat-name">{chat.name}</span>
        </div>
        {isSidebarOpen && (
          <div className="chat-actions">
            <button
              className="action-btn rename-btn"
              onClick={(e) => startRename(section, index, chat.name, e, id)}
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

  const handleChatSelection = (chatName, chatId) => {
    setSelectedChatId(chatId);
    localStorage.setItem('selectedChatId', chatId);
    localStorage.setItem('selectedChatName', chatName);
    SelectedChat(chatName, chatId);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "closed"} ${isVisible ? 'visible' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {isSidebarOpen && (
            <div className="logo-text">
              <img
                style={{ width: "80px", height: "80px" }}
                src="../chats/2_FINAL_SEE_HEAR_SPEAK_IN_COLOR_ORIGINAL_COLOR.svg"
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
            <TbLayoutSidebarRightExpand size={26} />
          ) : (
            <TbLayoutSidebarLeftExpand size={26} />
          )}
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <FiPlus className="btn-icon" />
        {isSidebarOpen && <span onClick={CreateNewChat}> New Chat</span>}
      </button>

      <div className="sidebar-scroll">
        {isLoading ? (
          <div className="sidebar-loader">
            <HashLoader color="#4f96ff" size={50} />
          </div>
        ) : (
          isSidebarOpen && (
            <>
             <div className="sidebar-section">
    {chats?.today?.length > 0 && <h3>Today</h3>}
    <ul className="chat-list">
      {chats?.today?.map((chat, index) => (
        <div key={chat.id}>
          {renderChatItem(chat, index, "today", chat.id)}
        </div>
      ))}
    </ul>
  </div>

              <div className="sidebar-section">
                {chats.yesterday.length > 0 && <h3>Yesterday</h3>}
                <ul className="chat-list">
                  {chats.yesterday.map((chat, index) =>
                    renderChatItem(chat, index, "yesterday", chat.id)
                  )}
                </ul>
              </div>

              <div className="sidebar-section">
              {chats.last7Days.length > 0 && <h3>Last 7 Days</h3>}
                <ul className="chat-list">
                  {chats.last7Days.map((chat, index) =>
                    renderChatItem(chat, index, "last7Days", chat.id)
                  )}
                </ul>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
