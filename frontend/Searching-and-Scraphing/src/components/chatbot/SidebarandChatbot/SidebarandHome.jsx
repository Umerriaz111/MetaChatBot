import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import Chatbot from '../chatbot/Chatbot'
import { useParams } from 'react-router-dom';
import { useState } from 'react';

const SidebarandHome = () => {
  const [IsChatSelected, setIsChatSelected] = useState();

  const SelectedChat = (name,id) => {
    console.log("this is What I got from Sidebar ",name,"And id is ",id)
    setIsChatSelected(id);
  };

    const { chat } = useParams(); // Get the selected chat from the URL
    // Decode the URL encoded string
    const decodedChatName = decodeURIComponent(chat); 
  return (
    <>
    <Sidebar SelectedChat={SelectedChat}/>
    <Chatbot chatName={decodedChatName} id={IsChatSelected} />
    </>
  )
}

export default SidebarandHome
