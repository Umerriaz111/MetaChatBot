import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import { FcGoogle } from "react-icons/fc";
import { SiDuckduckgo } from "react-icons/si";
import { BsBing } from "react-icons/bs";
import { TbBrandYahoo } from "react-icons/tb";
import { TbBrandWikipedia } from "react-icons/tb";
import { FaGithub } from "react-icons/fa";
import { BsAmazon } from "react-icons/bs";
import { SiMojeek } from "react-icons/si";
import { FaYandex } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { SiEcosia } from "react-icons/si";
import { useParams } from "react-router-dom";
import { PulseLoader, SyncLoader, BarLoader } from "react-spinners";
import useClipboard from "react-use-clipboard";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiClipboard, FiCheckCircle } from 'react-icons/fi';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarRightExpand } from "react-icons/tb";


const BASE_URL = "http://127.0.0.1:8000";

const Chatbot = ({ chatName, id, onToggleSidebar, showSidebar }) => {
 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(null); // Index of the message being processed
  const [isChangingChat, setIsChangingChat] = useState(true); // New state for chat switching
  const chatWindowRef = useRef(null); // Reference to the chat window
  const [isCopied, setCopied] = useClipboard("Text to copy");
  const [selectedIcons, setSelectedIcons] = useState(new Set());
  const [numResults, setNumResults] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState('searching');

  useEffect(() => {
    setIsChangingChat(true); // Start loading when chat changes
    console.log("Current Session ID:", id); // Debug log
    
    const timer = setTimeout(() => {
      if (chatName !== "newchat" && id) { // Only proceed if we have an ID
        async function getSessionMessages(sessionId) {
          const url = `${BASE_URL}/api/sessions/${sessionId}/messages/`;
      
          try {
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
            const result = await response.json();
            console.log("Messages for session", sessionId, ":", result);
            setMessages(result); // Set the messages from the API response
            return result;
          } catch (error) {
            console.error("Error fetching session messages:", error);
            return null;
          }
        }
        
        getSessionMessages(id);
      } else {
        setMessages([]); // Clear messages for new chat
      }
      setIsChangingChat(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [chatName, id]); // Add id to dependency array

  const handleIconClick = (iconName) => {
    toast.dismiss();
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
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

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
    if (!id) {
      toast.error('No active session. Please create a new chat.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (input.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Store message text and clear input
    const messageText = input;
    setInput("");

    // Add temporary user message immediately
    const tempUserMessage = {
      text: messageText,
      time: currentTime,
      sender: "user"
    };
    setMessages(prev => [...prev, tempUserMessage]);
    
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        query: messageText,
        number_of_items: numResults || 2,
        engines: Array.from(selectedIcons).join(',') ,
        message_type: selectedOption
      });

      const response = await fetch(
        `${BASE_URL}/api/sessions/${id}/messages/?${queryParams}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Replace temporary message with actual response
      setMessages(prev => {
        const messagesWithoutTemp = prev.slice(0, -1); // Remove temporary message
        return [
          ...messagesWithoutTemp,
          {
            user_message: data.user_message,
            chatbot_response: data.chatbot_response,
            created_at: data.created_at,
            message_type: data.message_type
          }
        ];
      });

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        text: "Error While Getting the Response",
        time: currentTime,
        sender: "support"
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // Remove temp message and add error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setMenuOpen(false);
    toast.success(`${option} mode selected`, {
      position: "top-right",
      autoClose: 2000,
      theme: "colored",
    });
  };

  const handleNumResultsChange = (e) => {
    let value = e.target.value;
    
    // Remove leading zeros
    value = value.replace(/^0+/, '');
    
    // If empty, set to 0
    if (value === '') {
      value = '0';
    }
    
    // Convert to number and ensure it's within bounds (0-100)
    const numValue = Math.min(Math.max(parseInt(value) || 0, 0), 100);
    
    setNumResults(numValue.toString());
  };

  // First, add this helper function to parse the chatbot response
  const parseSearchResults = (response) => {
    try {
      // If response is already a string, try to parse it
      if (typeof response === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(response);
          return parsed;
        } catch (e) {
          // If direct JSON parse fails, try to extract multiple results from string
          const results = [];
          
          // Match URL, title, content and engine patterns
          const matches = response.matchAll(/['"](url|title|content|engine)['"]:\s*['"](.*?)['"]/g);
          let currentResult = {};
          
          for (const match of matches) {
            const [_, key, value] = match;
            
            if (key === 'url' && Object.keys(currentResult).length > 0) {
              results.push(currentResult);
              currentResult = {};
            }
            
            currentResult[key] = value;
          }
          
          if (Object.keys(currentResult).length > 0) {
            results.push(currentResult);
          }

          return results.length > 0 ? results : response;
        }
      }
      return response;
    } catch (error) {
      console.error('Error parsing search results:', error);
      return response;
    }
  };

  return (
    <div className="chatbot-container">
      {isChangingChat ? (
        <div className="loader-container">
          <BarLoader color="#2a91c4"  loading={true} width={150} />
        </div>
      ) : (
        <>
          <header className="chatbot-header">
            <div className="header-left">
              {!showSidebar && (
                <TbLayoutSidebarLeftExpand 
                  size={26} 
                  onClick={onToggleSidebar}
                  className="sidebar-toggle-icon"
                />
              )}
              <img src="./2_FINAL_SEE_HEAR_SPEAK_IN_COLOR_ORIGINAL_COLOR.svg" alt="Logo" className="logo" />
            </div>
            <h1>Searching and Scraping Bot</h1>
            <div className="header-right">
              {showSidebar && (
                <TbLayoutSidebarRightExpand 
                  size={26}
                  onClick={onToggleSidebar}
                  className="sidebar-toggle-icon sidebar-visible"
                />
              )}
              <div className="menu-container">
                <BsThreeDots
                  className="menu-icon" 
                  onClick={() => setMenuOpen(!menuOpen)} 
                />
                {menuOpen && (
                  <div className="menu-dropdown">
                    <div 
                      className={`menu-item ${selectedOption === 'searching' ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('searching')}
                    >
                      Searching
                    </div>
                    <div 
                      className={`menu-item ${selectedOption === 'scraping' ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('scraping')}
                    >
                      Scraping
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, index) => {
              // Handle messages from the database
              if (msg.user_message && msg.chatbot_response) {
                const parsedResponse = parseSearchResults(msg.chatbot_response);
                
                return (
                  <React.Fragment key={index}>
                    {/* User message */}
                    <div className="chat-message user">
                      <p>{msg.user_message}</p>
                      <span className="time">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Chatbot response */}
                    <div className="chat-message support">
                      <div className="search-results">
                        {Array.isArray(parsedResponse) ? (
                          parsedResponse.map((result, resultIndex) => (
                            <div key={resultIndex} className="search-result">
                              <div className="result-header">
                                <h4 className="result-title">
                                  {result.title || 'Title'}
                                </h4>
                              </div>
                              <div className="result-content">
                                {result.content && <p>{result.content}</p>}
                                {result.url && (
                                  <p className="result-url">
                                    URL: 
                                    <span className="link-container">
                                      <a href={result.url} target="_blank" rel="noopener noreferrer">
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
                                {result.engine && (
                                  <p className="result-source">Result from: {result.engine}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>{typeof parsedResponse === 'string' ? parsedResponse : JSON.stringify(parsedResponse)}</p>
                        )}
                      </div>
                      <span className="time">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </React.Fragment>
                );
              }
              
              // Handle existing message format (for new messages)
              return (
                <div key={index} className={`chat-message ${msg.sender}`}>
                  {msg.object ? (
                    <div className="search-results">
                      {Array.isArray(msg.object) ? (
                        msg.object.length === 0 ? (
                          <p className="no-results">Unfortunately, I am not in a position to offer assistance with this specific query at this time.</p>
                        ) : (
                          <>
                          
                            {msg.object.map((result, resultIndex) => (
                              <div key={resultIndex} className="search-result">
                                {result.title && (
                                  <h4 className="result-title">{result.title}</h4>
                                )}
                                {result.content && (
                                  <p className="result-content">{result.content}</p>
                                )}
                                {result.url && (
                                  <p className="result-url">
                                    Product URL:
                                    <span className="link-container">
                                      <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="result-link"
                                      >
                                        {result.url}
                                      </a>
                                      <button
                                        className="copy-link-btn"
                                        onClick={() => copyToClipboard(result.link)}
                                        title="Copy link to clipboard"
                                      >
                                        <FiClipboard size={14} />
                                      </button>
                                    </span>
                                  </p>
                                )}
                                {result.engine && (
                                  <p className="result-source">
                                    Result from: {result.engine}
                                  </p>
                                )}
                              </div>
                            ))}
                          </>
                        )
                      ) : (
                        <p className="object-fallback">{msg.object}</p>
                      )}
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  <span className="time">{msg.time}</span>
                </div>
              );
            })}
            {/* Show the spinner only when a new message is being processed */}
            {loading && (
              <div className="loading-spinner">
                <SyncLoader color="#2a91c4" loading={loading} />
              </div>
            )}
          </div>

          <div className="chat-input">
            
            <div className="chat-input_message">
            <div className="number-input-container">
                <input
                  type="number"
                  className="number-input"
                  value={numResults}
                  onChange={handleNumResultsChange}
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="message-box"
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
                className={`icon-container ${selectedIcons.has('Yandex') ? 'selected' : ''}`}
                onClick={() => handleIconClick('Yandex')}
              >
                <FaYandex fontSize={23} />
              </span>
              
              <span 
                className={`icon-container ${selectedIcons.has('Ecosia') ? 'selected' : ''}`}
                onClick={() => handleIconClick('Ecosia')}
              >
                <SiEcosia fontSize={23} />
              </span>
              <span 
                className={`icon-container ${selectedIcons.has('Mojeek') ? 'selected' : ''}`}
                onClick={() => handleIconClick('Mojeek')}
              >
                <SiMojeek fontSize={23} />
              </span>
            </div>
          </div>
          <ToastContainer />
          {
            console.log("This is selectedOption",selectedOption)
          }
        </>
      )}
    </div>
  );
  
    
  
};

export default Chatbot;