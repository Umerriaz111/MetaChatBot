import React, { useState } from 'react';
import './Sidebar.css';
import { FiMessageSquare, FiPlus, FiChevronRight } from 'react-icons/fi';
import { FaBattleNet } from 'react-icons/fa';
import { GoSidebarExpand, GoSidebarCollapse } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';


const Sidebar = ({ onNewChat, onSelectChat }) => {
  // State to manage sidebar open/close status

  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Function to toggle sidebar state
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      {/* Sidebar Header with Logo and Toggle Button */}
      <div className="sidebar-header">
        <div className="logo-container">
          {/* <FaBattleNet fontSize={30} /> */}
        </div>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <GoSidebarExpand /> : <GoSidebarCollapse />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="sidebar-section">
        <button className="new-chat-btn" onClick={onNewChat} style={{ padding: isSidebarOpen ? '14px 24px' : '14px' }}>
          <FiPlus className="btn-icon" />
          {isSidebarOpen && 'New chat'}
        </button>
      </div>

      {/* Chat List - Only Visible When Sidebar is Open */}
      {isSidebarOpen && (
        <div className="sidebar-scroll">
          {/* Today's Chats */}
          <div className="sidebar-section">
      <h3>Today</h3>
      <ul className="chat-list">
        {["What is React", "Search Shoes Under $10 ", "Scraph Nike Shoes"].map((chat, index) => (
          <li 
            key={index} 
            onClick={() => navigate(`/chats/${chat}`)} // Navigate to the specific chat
            style={{ cursor: 'pointer' }} // Optional: adds a pointer cursor to show it's clickable
          >
            <FiMessageSquare className="chat-icon" />
            {chat}
            <FiChevronRight className="chevron-icon" />
          </li>
        ))}
      </ul>
    </div>
          {/* Yesterday's Chats */}
          <div className="sidebar-section">
            <h3>Yesterday</h3>
            <ul className="chat-list">
              {["Chat 3", "Chat 4"].map((chat, index) => (
                <li key={index} 
                onClick={() => navigate(`/chats/${chat}`)} // Navigate to the specific chat
                style={{ cursor: 'pointer' }} // Optional: adds a pointer cursor to show it's clickable
                >
                  <FiMessageSquare className="chat-icon" />
                  {chat}
                  <FiChevronRight className="chevron-icon" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
