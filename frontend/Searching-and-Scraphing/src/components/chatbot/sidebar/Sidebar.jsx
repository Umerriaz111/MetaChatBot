import React, { useState } from 'react';
import './Sidebar.css';
import { FiMessageSquare, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { TbLayoutSidebarRightCollapseFilled, TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sidebar = ({ onNewChat, onSelectChat }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingChat, setEditingChat] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [chats, setChats] = useState({
    today: ["What is React", "Search Shoes Under $10 ", "Scraph Nike Shoes"],
    yesterday: ["Chat 3", "Chat 4"]
  });

  const showToast = (message, type = 'success') => {
    const toastOptions = {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      toastId: message, // Prevent duplicate toasts with the same message
    };
    
    if (type === 'success') {
      toast.success(message, toastOptions);
    } else if (type === 'error') {
      toast.error(message, toastOptions);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.body.classList.toggle('sidebar-closed');
  };

  const handleDelete = (section, index, e) => {
    e.stopPropagation();
    const chatName = chats[section][index];
    setChats(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
    showToast(`Deleted chat: ${chatName}`);
  };

  const startRename = (section, index, currentName, e) => {
    e.stopPropagation();
    setEditingChat(`${section}-${index}`);
    setEditedName(currentName);
  };

  const handleRename = (section, index, e) => {
    e.preventDefault();
    if (editedName.trim()) {
      const oldName = chats[section][index];
      setChats(prev => ({
        ...prev,
        [section]: prev[section].map((chat, i) => 
          i === index ? editedName : chat
        )
      }));
      setEditingChat(null);
      setEditedName('');
      showToast(`Renamed chat: ${oldName} → ${editedName}`);
    }
  };

  const renderChatItem = (chat, index, section) => {
    const isEditing = editingChat === `${section}-${index}`;

    if (isEditing) {
      return (
        <li key={index} className="chat-item editing">
          <form onSubmit={(e) => handleRename(section, index, e)} className="rename-form">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              autoFocus
              onBlur={(e) => handleRename(section, index, e)}
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
              onClick={(e) => startRename(section, index, chat, e)}
              title="Rename chat"
            >
              <FiEdit2 />
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={(e) => handleDelete(section, index, e)}
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
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {isSidebarOpen && <span className="logo-text">AI Chat</span>}
        </div>
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <TbLayoutSidebarLeftCollapseFilled /> : <TbLayoutSidebarRightCollapseFilled />}
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <FiPlus className="btn-icon" />
        {isSidebarOpen && <span>New Chat</span>}
      </button>

      <div className="sidebar-scroll">
        {isSidebarOpen && (
          <>
            <div className="sidebar-section">
              <h3>Today</h3>
              <ul className="chat-list">
                {chats.today.map((chat, index) => renderChatItem(chat, index, 'today'))}
              </ul>
            </div>
            
            <div className="sidebar-section">
              <h3>Yesterday</h3>
              <ul className="chat-list">
                {chats.yesterday.map((chat, index) => renderChatItem(chat, index, 'yesterday'))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
