
import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import { FcGoogle } from "react-icons/fc";
import { SiDuckduckgo } from "react-icons/si";
import { BsBing } from "react-icons/bs";
import { TbBrandYahoo } from "react-icons/tb";
import { TbBrandWikipedia } from "react-icons/tb";
import { FaGithub } from "react-icons/fa";
import { BsAmazon } from "react-icons/bs";
import { SiStartpage } from "react-icons/si";
import { FaYandex } from "react-icons/fa";
import { SiQwant } from "react-icons/si";
import { SiEcosia } from "react-icons/si";
import { useParams } from "react-router-dom";
import { PulseLoader ,SyncLoader } from "react-spinners";

import { Clipboard } from "flowbite-react";

const Chatbot = ({ chatName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(null); // Index of the message being processed
  const chatWindowRef = useRef(null); // Reference to the chat window

  useEffect(() => {
    const initialMessages = [
      {
        text: "Hi How are you?",
        time: "09:00 AM",
        sender: "user",
      },

      {
        text: "Hello, how can I assist you today?",
        time: "09:00 AM",
        sender: "support",
      },
      {
        text: "I have a question about my order status.",
        time: "09:02 AM",
        sender: "user",
      },
      {
        text: "Can you please provide your order number?",
        time: "09:03 AM",
        sender: "support",
      },
      { text: "My order number is 123456.", time: "09:05 AM", sender: "user" },
      {
        text: "Thank you for that. Let me check the status for you.",
        time: "09:06 AM",
        sender: "support",
      },
    ];
    setMessages(initialMessages); // Set initial message history
  }, []);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user's message
    const userMessage = { text: input, time: currentTime, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Clear the input box
    setInput("");
    
    // Set loading state to true and track the index of the current message
    setLoading(true);
    setCurrentLoadingIndex(messages.length); // Set the current message index to show the spinner

    // Fetch data from API
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/search/?query=${encodeURIComponent(input)}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      // Create the support message
      const supportMessage = {
        text: data.response || "Error While Getting the Response", // Use response from API
        time: currentTime,
        sender: "support",
      };

      // Append support response to the message history
      setMessages((prevMessages) => [...prevMessages, supportMessage]);
    } catch (error) {
      console.error("Error calling the API:", error);
    } finally {
      setLoading(false);
      setCurrentLoadingIndex(null); // Reset the current loading index once the response is received
    }
  };

  // Scroll to the bottom of the chat window whenever messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot-container">
      <header className="chatbot-header">
        <img src="./world.png" alt="Logo" className="logo" />
        <h1>Searching and Scraping Bot</h1>
      </header>

      <div className="chat-window" ref={chatWindowRef}>
      {messages.map((msg, index) => (
        msg.sender === "support" ? (
          <div key={index} className={`chat-message ${msg.sender}`}>
         
          <p>{msg.text}</p>
          <p>Product Search Engine</p>
          <p>Product Title is:</p>
          <p>Product Content is:</p>
          <p>Product Url is:</p>
          

          <span className="time">{msg.time}</span>
        </div>
        ):(
          <div key={index} className={`chat-message ${msg.sender}`}>
    <p>{msg.text}</p>
    <span className="time">{msg.time}</span>
  </div>
        )
  
))}
{/* Show the spinner only when a new message is being processed */}
{loading && (
  <div className="loading-spinner">
    <SyncLoader color="#2a91c4" loading={loading} />
  </div>
)}
      </div>

      <div className="chat-input">
        <div className="chat-input_message">
          <input
            type="text"
            placeholder="Type a message..."
            className="message-box"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-button" onClick={sendMessage}>
            <img src="./paper-plane.png" alt="Send" />
          </button>
        </div>
        <div className="search-icon">
          <span className="icon-container">
            <FcGoogle fontSize={23} />
          </span>
          <span className="icon-container">
            <SiDuckduckgo fontSize={23} />
          </span>
          <span className="icon-container">
            <BsBing fontSize={23} />
          </span>
          <span className="icon-container">
            <TbBrandYahoo fontSize={23} />
          </span>
          <span className="icon-container">
            <TbBrandWikipedia fontSize={23} />
          </span>
          <span className="icon-container">
            <FaGithub fontSize={23} />
            
          </span>
          <span className="icon-container">
            <BsAmazon fontSize={23} />
          </span>
          <span className="icon-container">
            <SiStartpage fontSize={23} />
          </span>
          <span className="icon-container">
            <FaYandex fontSize={23} />
          </span>
          <span className="icon-container">
            <SiQwant fontSize={23} />
          </span>
          <span className="icon-container">
            <SiEcosia fontSize={23} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
