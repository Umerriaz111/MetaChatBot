import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import Chatbot from '../chatbot/Chatbot'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SidebarandHome = () => {
  const [selectedChatId, setSelectedChatId] = useState(() => {
    // Initialize from localStorage if available
    const savedId = localStorage.getItem('selectedChatId');
    return savedId ? parseInt(savedId) : null;
  });
  
  const [selectedChatName, setSelectedChatName] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('selectedChatName') || null;
  });

  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const SelectedChat = (name, id) => {
    console.log("Selected chat:", name, "with ID:", id);
    setSelectedChatId(id);
    setSelectedChatName(name);
    // Store in localStorage
    localStorage.setItem('selectedChatId', id);
    localStorage.setItem('selectedChatName', name);
  };

  const { chat } = useParams();
  const decodedChatName = decodeURIComponent(chat);

  // Update selected chat name when URL changes
  useEffect(() => {
    if (decodedChatName && decodedChatName !== "newchat") {
      setSelectedChatName(decodedChatName);
      localStorage.setItem('selectedChatName', decodedChatName);
    }
  }, [decodedChatName]);

  return (
    <>
      <Sidebar 
        SelectedChat={SelectedChat} 
        initialSelectedId={selectedChatId}
        isVisible={showSidebar}
      />
      <Chatbot 
        chatName={selectedChatName || decodedChatName} 
        id={selectedChatId} 
        onToggleSidebar={toggleSidebar}
        showSidebar={showSidebar}
      />
    </>
  );
};

export default SidebarandHome
