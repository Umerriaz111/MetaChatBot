import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import './Home.css'

const Home = () => {
  return (
    <>
      <Sidebar />
      <div className="container">
      <h1>Welcome back!</h1>
      <h1>How can I help you today?</h1>
      
      <p>
        I can assist with a variety of tasks such as:
      </p>
      <ul>
        <li>Answering your questions</li>
        <li>Providing recommendations</li>
        <li>Helping you find resources</li>
        <li>And much more...</li>
      </ul>

      <p>
        Just ask away, and I'll do my best to assist you! 😊
      </p>

      <button onClick={() => alert("Let's Chat!")}>Start Chat</button>
    </div>
    </>
  )
}

export default Home
