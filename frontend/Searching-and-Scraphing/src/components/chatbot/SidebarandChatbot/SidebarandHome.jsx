import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import Chatbot from '../chatbot/Chatbot'
import { useParams } from 'react-router-dom';

const SidebarandHome = () => {

    const { chat } = useParams(); // Get the selected chat from the URL
    // Decode the URL encoded string
    const decodedChatName = decodeURIComponent(chat); 
  return (
    <>
    <Sidebar />
    <Chatbot chatName={decodedChatName} />
    </>
  )
}

export default SidebarandHome
