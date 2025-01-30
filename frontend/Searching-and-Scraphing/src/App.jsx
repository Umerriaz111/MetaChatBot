import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chatbot from './components/chatbot/chatbot/Chatbot';
import Sidebar from './components/chatbot/sidebar/Sidebar';
import Home from './components/chatbot/Home/Home';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import SidebarandHome from './components/chatbot/SidebarandChatbot/SidebarandHome';

function App() {
  const [count, setCount] = useState(0)
  const [showChatbot, setShowChatbot] = useState(false);
  const handleNewChat = () => {
    setShowChatbot(true); // Show chatbot when "New Chat" is clicked
};
  return (

    // Will use This Logic again
    // <>
    // <Sidebar onNewChat={handleNewChat} />
    //         <div >
    //             {showChatbot && <Chatbot />} {/* Render chatbot if showChatbot is true */}
    //         </div> 
  
    //         {/* <Chatbot />
    //         <Sidebar/> */}
    // </> 
    <>
     <BrowserRouter>
      <Routes>
      <Route path="/chats/:chat" element={<SidebarandHome />} /> 
       <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
    </>
    
  )
}

export default App
