import React, { useEffect, useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import { FaSearch, FaRobot, FaDatabase, FaArrowRight, FaBars } from 'react-icons/fa';
import { BiSearchAlt } from 'react-icons/bi';
import { AiOutlineApi } from 'react-icons/ai';
import './Home.css';

const Home = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
   
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content hidden">
            <div className="hero-badge">Powered by AI</div>
            <h1 className="main-title">
              Advanced Search & Scraping
              <span className="highlight">Assistant</span>
            </h1>
            <p className="hero-description">
              Unlock the power of intelligent search and data extraction across multiple engines
            </p>
            <div className="cta-group">
              <button className="cta-button primary">
                <FaRobot className="button-icon" />
                Start Your Journey
                <FaArrowRight className="arrow-icon" />
              </button>
              <button className="cta-button secondary">
                Watch Demo
              </button>
            </div>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Search Engines</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Searches</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2 className="section-title hidden">Our Powerful Services</h2>
          <div className="feature-cards">
            <div className="feature-card hidden">
              <div className="card-icon-wrapper">
                <BiSearchAlt />
              </div>
              <h3>Multi-Engine Search</h3>
              <p>Get comprehensive results from multiple search engines in one place. Save time and discover more.</p>
              <div className="card-footer">
                <button className="learn-more">Learn More <FaArrowRight /></button>
              </div>
            </div>

            <div className="feature-card hidden">
              <div className="card-icon-wrapper">
                <FaDatabase />
              </div>
              <h3>Smart Web Scraping</h3>
              <p>Extract valuable data from any website with our advanced scraping technology.</p>
              <div className="card-footer">
                <button className="learn-more">Learn More <FaArrowRight /></button>
              </div>
            </div>

            <div className="feature-card hidden">
              <div className="card-icon-wrapper">
                <AiOutlineApi />
              </div>
              <h3>Intelligent Analysis</h3>
              <p>Transform raw data into actionable insights with our smart analysis tools.</p>
              <div className="card-footer">
                <button className="learn-more">Learn More <FaArrowRight /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="action-section hidden">
          <div className="action-content">
            <h2>Ready to Transform Your Search Experience?</h2>
            <p>Join thousands of users who have already upgraded their search and scraping capabilities</p>
            <button className="gradient-button">
              <FaSearch className="button-icon" />
              Get Started Now
              <FaArrowRight className="arrow-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;