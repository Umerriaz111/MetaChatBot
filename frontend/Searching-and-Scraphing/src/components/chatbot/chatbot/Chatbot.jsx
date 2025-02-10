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

const Chatbot = ({ chatName }) => {
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
  //Searching or Scraphing Options is Saved Here
  const [selectedOption, setSelectedOption] = useState('Searching');

  useEffect(() => {
    setIsChangingChat(true); // Start loading when chat changes
    
    // Simulate loading time
    const timer = setTimeout(() => {
      if (chatName !== "newchat") {
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
        setMessages(initialMessages); // Set initial message history only if not a new chat
      } else {
        setMessages([]); // Clear messages for new chat
      }
      setIsChangingChat(false); // Stop loading after content is set
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [chatName]);

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
    
    // Check if any icons are selected
    // if (selectedIcons.size === 0) {
    //   const noIconMessage = {
    //     text: "Please select at least one search engine icon before searching.",
    //     time: currentTime,
    //     sender: "support",
    //   };
    //   setMessages((prevMessages) => [...prevMessages, noIconMessage]);
    //   return;
    // }
   
    
    // Set loading state to true and track the index of the current message
    setLoading(true);
    setCurrentLoadingIndex(messages.length); // Set the current message index to show the spinner

    // Fetch data from API
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/search2/?query=${encodeURIComponent(input)}&number_of_items=${numResults}&engines=${Array.from(selectedIcons).join(',')}`,
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

  return (
    <div className="chatbot-container">
      {isChangingChat ? (
        <div className="loader-container">
          <BarLoader color="#2a91c4"  loading={true} width={150} />
        </div>
      ) : (
        <>
          <header className="chatbot-header">
            <img src="./2_FINAL_SEE_HEAR_SPEAK_IN_COLOR_ORIGINAL_COLOR.svg" alt="Logo" className="logo" />
            <h1>Searching and Scraping Bot</h1>
            <div className="menu-container">
              <BsThreeDots
                className="menu-icon" 
                onClick={() => setMenuOpen(!menuOpen)} 
              />
              {menuOpen && (
                <div className="menu-dropdown">
                  <div 
                    className={`menu-item ${selectedOption === 'Searching' ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('Searching')}
                  >
                    Searching
                  </div>
                  <div 
                    className={`menu-item ${selectedOption === 'Scraping' ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('Scraping')}
                  >
                    Scraping
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, index) => (
              msg.sender === "support" ? (
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
              ) : (
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
            <div className="number-input-container">
                <input 
                  type="number" 
                  placeholder="Results"
                  className="number-input"
                  value={numResults}
                  min="0"

                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    setNumResults(value);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginRight: '10px',
                    width: '80px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
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