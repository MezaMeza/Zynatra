import React, { useState, Component } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Login from "./views/Login/Login";
import Sidebar from "./components/Sidebar";
import StudentDashboard from "./views/Dashboard/StudentDashboard";
import TeacherDashboard from "./views/Teacher/TeacherDashboard";
import SuperuserDashboard from "./views/Superuser/SuperuserDashboard";
import VocationalTest from "./views/Vocational/VocationalTest";
import NetworkDirectory from "./views/Network/NetworkDirectory";
import VirtualAdvisor from "./views/Advisor/VirtualAdvisor";
import ResourceLibrary from "./views/Resources/ResourceLibrary";
import ProgressHub from "./views/Progress/ProgressHub";
import GamesHub from "./views/Games/GamesHub";
import "./App.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "#f5f0e8", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{ color: "#2d3436" }}>Reconectando Zynatra...</h3>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div style={{
        display: "flex", height: "100vh", alignItems: "center", justifyContent: "center",
        fontSize: "1.2rem", fontWeight: 600, color: "var(--text-secondary)", backgroundColor: "#f5f0e8"
      }}>
        Cargando Zynatra...
      </div>
    );
  }

  if (!currentUser) return <Login />;

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        if (currentUser.rol === "student") return <StudentDashboard setActiveTab={setActiveTab} />;
        if (currentUser.rol === "teacher") return <TeacherDashboard setActiveTab={setActiveTab} />;
        if (currentUser.rol === "admin") return <SuperuserDashboard />;
        return <div>Página no encontrada</div>;

      case "vocational":
        return <VocationalTest setActiveTab={setActiveTab} />;

      case "advisor":
        return <VirtualAdvisor setActiveTab={setActiveTab} />;

      case "resources":
        return <ResourceLibrary />;

      case "progress":
        return <ProgressHub setActiveTab={setActiveTab} />;

      case "games":
        return <GamesHub />;

      case "network":
        return <NetworkDirectory setActiveTab={setActiveTab} />;

      default:
        if (currentUser.rol === "student") return <StudentDashboard setActiveTab={setActiveTab} />;
        return <div>Página no encontrada</div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">{renderActiveView()}</main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
