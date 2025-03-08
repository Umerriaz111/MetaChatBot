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
import { motion } from 'framer-motion';
import { BiSearchAlt } from 'react-icons/bi';
import { FaScroll } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import ReactDOMServer from 'react-dom/server';


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
    // Dismiss any existing toasts first
    toast.dismiss();
    
    setSelectedIcons(prev => {
      const newSelection = new Set(prev);
      const wasSelected = newSelection.has(iconName);
      
      if (wasSelected) {
        newSelection.delete(iconName);
      } else {
        newSelection.add(iconName);
      }

      // Show a single toast with the appropriate message
      toast(wasSelected ? `${iconName} has been unselected` : `${iconName} has been selected`, {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
        type: wasSelected ? "info" : "success",
        icon: wasSelected ? "🔴" : "✨",
        toastId: `icon-selection-${iconName}`, // Prevent duplicate toasts
      });

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
        number_of_items: numResults,
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
    
    // Get the icon and message based on the selected option
    let IconComponent;
    let iconColor;
    let modeMessage;
    let particleColors;
    
    switch(option) {
      case 'searching':
        IconComponent = BiSearchAlt;
        iconColor = '#4a90e2';
        modeMessage = 'Search Mode Activated';
        particleColors = ['#4a90e2', '#357abd', '#64b5f6'];
        break;
      case 'scraping':
        IconComponent = FaScroll;
        iconColor = '#43a047';
        modeMessage = 'Web Scraping Initialized';
        particleColors = ['#43a047', '#2e7d32', '#66bb6a'];
        break;
      case 'chatting':
        IconComponent = BsChatDots;
        iconColor = '#9c27b0';
        modeMessage = 'You are Now Chatting with Scraph Data';
        particleColors = ['#9c27b0', '#7b1fa2', '#ba68c8'];
        break;
      case 'download':
        IconComponent = FiDownload;
        iconColor = '#ff9800';
        modeMessage = 'Downloading Scraped Data, Wait for a While';
        particleColors = ['#ff9800', '#f57c00', '#ffb74d'];
        break;
      default:
        IconComponent = BiSearchAlt;
        iconColor = '#4a90e2';
        modeMessage = 'Search Mode Activated';
        particleColors = ['#4a90e2', '#357abd', '#64b5f6'];
    }

    // Create the animated element
    const animatedElement = document.createElement('div');
    animatedElement.className = 'mode-change-indicator';
    document.body.appendChild(animatedElement);

    // Create the icon container with enhanced 3D effect
    const iconContainer = document.createElement('div');
    iconContainer.className = 'selected-mode-icon';
    
    // Create SVG element for the icon with glowing effect
    const svgString = ReactDOMServer.renderToString(
      <IconComponent style={{ 
        fontSize: '64px', 
        color: iconColor,
        filter: `drop-shadow(0 0 20px ${iconColor})`
      }} />
    );
    iconContainer.innerHTML = svgString;
    
    // Create the mode title with enhanced styling
    const modeTitle = document.createElement('div');
    modeTitle.className = 'mode-title';
    modeTitle.innerHTML = `
      <div class="mode-title-main">${option.charAt(0).toUpperCase() + option.slice(1)} Mode</div>
      <div class="mode-title-sub">${modeMessage}</div>
    `;
    
    // Create enhanced particles container
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    
    // Create more particles with enhanced effects
    for (let i = 0; i < 36; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Enhanced particle properties
      const size = Math.random() * 6 + 2;
      const delay = Math.random() * 0.8;
      const rotation = i * 14;
      const distance = Math.random() * 100 + 150;
      const color = particleColors[i % particleColors.length];
      
      particle.style.setProperty('--size', `${size}px`);
      particle.style.setProperty('--delay', `${delay}s`);
      particle.style.setProperty('--rotation', `${rotation}deg`);
      particle.style.setProperty('--distance', `${distance}px`);
      particle.style.setProperty('--color', color);
      particle.style.background = color;
      
      const initialZ = Math.random() * 200 - 100;
      particle.style.transform = `translateZ(${initialZ}px)`;
      
      particlesContainer.appendChild(particle);
    }

    // Create enhanced ripple container
    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container';
    
    // Create more ripples with enhanced effects
    for (let i = 0; i < 8; i++) {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.setProperty('--delay', `${i * 0.15}s`);
      ripple.style.setProperty('--scale', `${1 + i * 0.4}`);
      ripple.style.borderColor = iconColor;
      rippleContainer.appendChild(ripple);
    }

    // Enhanced mouse move event for 3D effect
    const handleMouseMove = (e) => {
      const rect = animatedElement.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 10;
      const y = (e.clientY - rect.top - rect.height / 2) / 10;
      
      const rotateX = y * -1;
      const rotateY = x;
      
      animatedElement.style.transform = `
        translate(-50%, -50%)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.05, 1.05, 1.05)
      `;
      
      iconContainer.style.transform = `
        translateZ(60px)
        rotateX(${rotateX * 1.2}deg)
        rotateY(${rotateY * 1.2}deg)
        scale3d(1.1, 1.1, 1.1)
      `;
      
      modeTitle.style.transform = `
        translateZ(40px)
        rotateX(${rotateX * 0.8}deg)
        rotateY(${rotateY * 0.8}deg)
      `;
    };

    // Enhanced mouse enter/leave events
    const handleMouseEnter = () => {
      animatedElement.style.transition = 'none';
      iconContainer.style.transition = 'none';
      modeTitle.style.transition = 'none';
    };

    const handleMouseLeave = () => {
      animatedElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      iconContainer.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      modeTitle.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      
      animatedElement.style.transform = 'translate(-50%, -50%) scale3d(1, 1, 1)';
      iconContainer.style.transform = 'translateZ(40px) scale3d(1, 1, 1)';
      modeTitle.style.transform = 'translateZ(20px)';
    };

    // Add event listeners
    animatedElement.addEventListener('mousemove', handleMouseMove);
    animatedElement.addEventListener('mouseenter', handleMouseEnter);
    animatedElement.addEventListener('mouseleave', handleMouseLeave);

    // Append all elements
    animatedElement.appendChild(rippleContainer);
    animatedElement.appendChild(particlesContainer);
    animatedElement.appendChild(iconContainer);
    animatedElement.appendChild(modeTitle);

    // Enhanced removal animation
    setTimeout(() => {
      animatedElement.classList.add('fade-out');
      
      // Remove event listeners
      animatedElement.removeEventListener('mousemove', handleMouseMove);
      animatedElement.removeEventListener('mouseenter', handleMouseEnter);
      animatedElement.removeEventListener('mouseleave', handleMouseLeave);
      
      setTimeout(() => {
        document.body.removeChild(animatedElement);
      }, 1000);
    }, 3000);
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
          // Check if the string represents an array of JSON objects
          if (response.trim().startsWith('[{') && response.trim().endsWith('}]')) {
            try {
              // Try to parse it with a more permissive approach - replace single quotes with double quotes
              const jsonString = response.replace(/'/g, '"');
              const parsed = JSON.parse(jsonString);
              return parsed;
            } catch (jsonError) {
              console.log("Failed to parse as JSON array:", jsonError);
            }
          }
          
          // If JSON parsing fails, try to extract fields using regex
          const results = [];
          let currentResult = {};
          
          // Match all field-value pairs in the format 'field': 'value' or "field": "value"
          const fieldRegex = /['"]([^'"]+)['"]\s*:\s*['"](.*?)['"](?=\s*,|\s*})/g;
          let match;
          
          // Extract the objects from the string
          const objectsRegex = /{([^{}]*)}/g;
          let objectMatch;
          
          while ((objectMatch = objectsRegex.exec(response)) !== null) {
            const objectContent = objectMatch[0];
            currentResult = {};
            
            // Reset the lastIndex to ensure we start from the beginning
            fieldRegex.lastIndex = 0;
            
            // Extract all fields from this object
            while ((match = fieldRegex.exec(objectContent)) !== null) {
              const [_, key, value] = match;
              currentResult[key] = value;
            }
            
            if (Object.keys(currentResult).length > 0) {
              results.push(currentResult);
            }
          }
          
          // If we couldn't extract objects, fall back to the old method
          if (results.length === 0) {
            // Match all field-value pairs throughout the string
            const allFieldsRegex = /['"]([^'"]+)['"]\s*:\s*['"](.*?)['"](?=\s*,|\s*})/g;
            currentResult = {};
            
            while ((match = allFieldsRegex.exec(response)) !== null) {
              const [_, key, value] = match;
              
              // Start a new result object when we encounter a new 'url' field
              if (key === 'url' && Object.keys(currentResult).length > 0) {
                results.push({...currentResult});
                currentResult = {};
              }
              
              currentResult[key] = value;
            }
            
            if (Object.keys(currentResult).length > 0) {
              results.push({...currentResult});
            }
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

  const parseScrapedText = (text) => {
    try {
      // Check if text contains numbered list items
      if (text.includes('\n1.')) {
        // Split the text into title and items
        const [title, ...items] = text.split('\n');
        return {
          title: title.trim(),
          items: items
            .filter(item => item.trim()) // Remove empty lines
            .map(item => item.trim())
        };
      }
      return text; // Return as is if not in expected format
    } catch (error) {
      console.error('Error parsing scraped text:', error);
      return text;
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
              <img src="../chats/2_FINAL_SEE_HEAR_SPEAK_IN_COLOR_ORIGINAL_COLOR.svg" alt="Logo" className="logo" />
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
                      <BiSearchAlt className="menu-icon" />
                      Searching
                    </div>
                    <div 
                      className={`menu-item ${selectedOption === 'scraping' ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('scraping')}
                    >
                      <FaScroll className="menu-icon" />
                      Scraping
                    </div>
                    <div 
                      className={`menu-item ${selectedOption === 'chatting' ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('chatting')}
                    >
                      <BsChatDots className="menu-icon" />
                      Chatting
                    </div>
                    <div 
                      className={`menu-item ${selectedOption === 'download' ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('download')}
                    >
                      <FiDownload className="menu-icon" />
                      Download Scrape Data
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
                        {msg.message_type === 'scraping' ? (
                          (() => {
                            const parsedText = parseScrapedText(msg.chatbot_response);
                            if (typeof parsedText === 'object') {
                              return (
                                <div className="scraped-content">
                                  <h3 className="scraped-title">{parsedText.title}</h3>
                                  <div className="scraped-items">
                                    {parsedText.items.map((item, idx) => (
                                      <div key={idx} className="scraped-item">
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return <p>{msg.chatbot_response}</p>;
                          })()
                        ) : Array.isArray(parsedResponse) ? (
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
                <img src="../chats/paper-plane.png" alt="Send" />
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

<style>
{`
  .menu-item {
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .menu-item:hover {
    background-color: #f5f5f5;
  }

  .menu-item.selected {
    background-color: #e3f2fd;
    color: #1976d2;
  }

  .menu-dropdown {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .scraped-content {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .scraped-title {
    color: #2a91c4;
    font-size: 1.1rem;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
  }

  .scraped-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .scraped-item {
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    transition: transform 0.2s ease;
  }

  .scraped-item:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`}
</style>