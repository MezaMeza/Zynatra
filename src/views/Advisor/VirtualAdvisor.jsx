import React, { useState, useRef, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { getAdvisorGreeting, getAdvisorSuggestions, getAdvisorResponse } from "../../data/advisor";

function renderMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

export default function VirtualAdvisor({ setActiveTab }) {
  const { studentInfo, finishDailyChallenge } = useData();
  const profile = studentInfo?.talentProfile;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const suggestions = getAdvisorSuggestions();

  useEffect(() => {
    setMessages([{ role: "assistant", text: getAdvisorGreeting(profile) }]);
  }, [profile?.perfilTop]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setTyping(true);

    await finishDailyChallenge("dc_advisor", 25);

    setTimeout(() => {
      const reply = getAdvisorResponse(userMsg, profile);
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px", margin: "0 auto", height: "calc(100vh - 8rem)" }}>
      <div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
          Orientador <span className="text-gradient-primary">Virtual IA</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Asistente inteligente para resolver dudas sobre carreras, becas y tu futuro en Nicaragua.
        </p>
      </div>

      <div className="glass-panel" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        minHeight: "400px",
        overflow: "hidden"
      }}>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingRight: "0.5rem",
          marginBottom: "1rem"
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "0.75rem",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              flexDirection: msg.role === "user" ? "row-reverse" : "row"
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                flexShrink: 0,
                background: msg.role === "user"
                  ? "linear-gradient(135deg, var(--primary), var(--secondary))"
                  : "rgba(139, 92, 246, 0.2)",
                border: "1px solid var(--border-glass)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} style={{ color: "var(--primary)" }} />}
              </div>
              <div className={msg.role === "user" ? "glass-card" : ""} style={{
                padding: "0.85rem 1.1rem",
                borderRadius: "var(--radius-md)",
                background: msg.role === "user" ? "rgba(139, 92, 246, 0.15)" : "#f1f5f9",
                border: "1px solid var(--border-glass)",
                fontSize: "0.9rem",
                lineHeight: "1.55",
                color: "var(--text-secondary)"
              }}>
                {renderMarkdown(msg.text)}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Bot size={18} style={{ color: "var(--primary)" }} />
              <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
                <Sparkles size={12} /> Polaris está escribiendo...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="btn btn-glass"
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", borderRadius: "20px" }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            type="text"
            className="input-field"
            placeholder="Pregunta sobre carreras, becas, habilidades..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            style={{ flex: 1 }}
          />
          <button onClick={() => sendMessage(input)} className="btn btn-primary" style={{ gap: "0.4rem" }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
