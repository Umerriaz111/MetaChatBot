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
import { PulseLoader, SyncLoader } from "react-spinners";
import useClipboard from "react-use-clipboard";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiClipboard, FiCheckCircle } from 'react-icons/fi';

const Chatbot = ({ chatName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(null); // Index of the message being processed
  const chatWindowRef = useRef(null); // Reference to the chat window
  const [isCopied, setCopied] = useClipboard("Text to copy");
  const [selectedIcons, setSelectedIcons] = useState(new Set());

  const handleIconClick = (iconName) => {
    setSelectedIcons(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(iconName)) {
        newSelection.delete(iconName);
        toast.info(`${iconName} has been unselected`, {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
          icon: "🔴"
        });
      } else {
        newSelection.add(iconName);
        toast.success(`${iconName} has been selected`, {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
          icon: "✨"
        });
      }
      return newSelection;
    });
  };

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

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      toast.success('🎉 Link copied to clipboard! 🚀', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#1a1a2e',
          color: '#fff',
          borderRadius: '8px',
          border: '1px solid rgba(79, 150, 255, 0.3)',
        },
      });
    }).catch(() => {
      toast.error('❌ Failed to copy link');
    });
  };

  const renderContent = (content) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (typeof content !== 'string') return content;
    
    const parts = content.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <span key={i} className="link-container">
            <a href={part} target="_blank" rel="noopener noreferrer">{part}</a>
            <button 
              className="copy-link-btn"
              onClick={() => copyToClipboard(part)}
              title="Copy link to clipboard"
            >
              <FiClipboard />
            </button>
          </span>
        );
      }
      return part;
    });
  };

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
      console.log("This is Data Response from backend",data['results'])

      // Create the support message
      const supportMessage = {
        object: data['results'] || "Error While Getting the Response", // Use response from API
        time: currentTime,
        sender: "support",
      };
      console.log("This is Support Message",supportMessage)

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
        {messages.map((msg, index) =>
          msg.sender === "support" ? (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.object ? (
                // Display search results if available
                <div className="search-results">
                  <h3>Search Results:</h3>
                  {Array.isArray(msg.object) ? (
                    msg.object.map((result, resultIndex) => (
                      <div key={resultIndex} className="search-result">
                        {result.title && (
                          <h4 className="result-title">
                             {result.title}
                          </h4>
                        )}
                        {result.content && (
                          <p className="result-content"> {result.content}</p>
                        )}
                        {result.url && (
                          <p className="result-url">
                            Product URL:
                            <span className="link-container">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {result.url}
                              </a>
                              <button 
                                className="copy-link-btn"
                                onClick={() => copyToClipboard(result.url)}
                                title="Copy link to clipboard"
                              >
                                <FiClipboard />
                              </button>
                            </span>
                          </p>
                        )}
                        {result.engines && (
                          <p className="result-url">
                            
                             Result from : {result.engines}
                            
                          </p>
                        )}

                      </div>
                    ))
                  ) : (
                    <p>{msg.object}</p>
                  )}
                </div>
              ) : (
                // Display regular text message
                <p>{msg.text}</p>
              )}
              <span className="time">{msg.time}</span>
            </div>
          ) : (
            // User message
            <div key={index} className={`chat-message ${msg.sender}`}>
              <p>{msg.text}</p>
              <span className="time">{msg.time}</span>
            </div>
          )
        )}
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
          <span 
            className={`icon-container ${selectedIcons.has('Google') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Google')}
          >
            <FcGoogle fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('DuckDuckGo') ? 'selected' : ''}`}
            onClick={() => handleIconClick('DuckDuckGo')}
          >
            <SiDuckduckgo fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Bing') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Bing')}
          >
            <BsBing fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Yahoo') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Yahoo')}
          >
            <TbBrandYahoo fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Wikipedia') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Wikipedia')}
          >
            <TbBrandWikipedia fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('GitHub') ? 'selected' : ''}`}
            onClick={() => handleIconClick('GitHub')}
          >
            <FaGithub fontSize={23} />
            
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Amazon') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Amazon')}
          >
            <BsAmazon fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('StartPage') ? 'selected' : ''}`}
            onClick={() => handleIconClick('StartPage')}
          >
            <SiStartpage fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Yandex') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Yandex')}
          >
            <FaYandex fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Qwant') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Qwant')}
          >
            <SiQwant fontSize={23} />
          </span>
          <span 
            className={`icon-container ${selectedIcons.has('Ecosia') ? 'selected' : ''}`}
            onClick={() => handleIconClick('Ecosia')}
          >
            <SiEcosia fontSize={23} />
          </span>
        </div>
      </div>
      <ToastContainer />
      {
  console.log("This is selectedIcons",selectedIcons)
}
    </div>


  );
 
};

export default Chatbot;
