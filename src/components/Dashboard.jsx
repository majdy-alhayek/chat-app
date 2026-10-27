import React, { useState } from "react";
import { Search, Send, LogOut, MessageSquare } from "lucide-react";
import "./Sidebar.css";
import "./ChatWindow.css";

export default function Dashboard({ user, onLogout }) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "أهلاً بك في تطبيق ChitChat!",
      sender: "incoming",
      time: "10:00 AM",
    },
    {
      id: 2,
      text: "أهلاً وسهلاً، الواجهة تبدو مذهلة جداً.",
      sender: "outgoing",
      time: "10:02 AM",
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: messageText,
      sender: "outgoing",
      time: new Date().toLocaleTimeString([], {
        hour: "2-dim",
        minute: "2-dim",
      }),
    };

    setMessages([...messages, newMsg]);
    setMessageText("");
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#030712",
      }}
    >
      {/* القائمة الجانبية */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-profile-info">
            <div
              className="app-logo-fallback"
              style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%" }}
            >
              <MessageSquare
                style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }}
              />
            </div>
            <div>
              <h3 className="sidebar-user-name">
                {user?.name || "مستخدم ChitChat"}
              </h3>
              <p className="sidebar-user-status">متصل الآن</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
            }}
            title="تسجيل الخروج"
          >
            <LogOut style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        <div className="sidebar-search-container">
          <input
            type="text"
            placeholder="بحث في المحادثات..."
            className="sidebar-search-input"
          />
        </div>

        <div className="conversations-list">
          <div className="conversation-item active">
            <div
              className="app-logo-fallback"
              style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%" }}
            >
              <MessageSquare
                style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }}
              />
            </div>
            <div className="conv-details">
              <div className="conv-header-row">
                <h4 className="conv-name">مجتمع ChitChat العام</h4>
                <span className="conv-time">10:02 AM</span>
              </div>
              <p className="conv-last-msg">
                أهلاً وسهلاً، الواجهة تبدو مذهلة...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* صندوق المحادثة الرئيسي */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-header-user">
            <div
              className="app-logo-fallback"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "50%",
              }}
            >
              <MessageSquare
                style={{ width: "1rem", height: "1rem", color: "#fff" }}
              />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#f1f5f9" }}>
                مجتمع ChitChat العام
              </h4>
              <span style={{ fontSize: "0.7rem", color: "#22c55e" }}>
                نشط الآن
              </span>
            </div>
          </div>
        </div>

        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              <span>{msg.text}</span>
              <div className="message-time">{msg.time}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="chat-input-field"
          />
          <button type="submit" className="send-msg-btn">
            <Send
              style={{ width: "1.1rem", height: "1.1rem", color: "#fff" }}
            />
          </button>
        </form>
      </div>
    </div>
  );
}
