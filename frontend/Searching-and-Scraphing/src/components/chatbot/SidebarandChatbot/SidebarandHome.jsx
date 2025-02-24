import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import Chatbot from '../chatbot/Chatbot'
import { useParams } from 'react-router-dom';
import { useState } from 'react';

const SidebarandHome = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const SelectedChat = (name, id) => {
    console.log("Selected chat:", name, "with ID:", id);
    setSelectedChatId(id);
  };

  const { chat } = useParams();
  const decodedChatName = decodeURIComponent(chat);

  return (
    <>
      <Sidebar SelectedChat={SelectedChat} />
      <Chatbot chatName={decodedChatName} id={selectedChatId} />
    </>
  );
};

export default SidebarandHome
