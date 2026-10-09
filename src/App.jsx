import { useState, Component, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Login from "./views/Login/Login";
import Sidebar from "./components/Sidebar";
import "./App.css";

// Views are code-split so the heavy Firebase-backed dashboards are only
// downloaded when the user actually navigates to them. Login stays eager
// because it is the first screen every unauthenticated user sees.
const StudentDashboard = lazy(() => import("./views/Dashboard/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./views/Teacher/TeacherDashboard"));
const SuperuserDashboard = lazy(() => import("./views/Superuser/SuperuserDashboard"));
const VocationalTest = lazy(() => import("./views/Vocational/VocationalTest"));
const NetworkDirectory = lazy(() => import("./views/Network/NetworkDirectory"));
const VirtualAdvisor = lazy(() => import("./views/Advisor/VirtualAdvisor"));
const ResourceLibrary = lazy(() => import("./views/Resources/ResourceLibrary"));
const ProgressHub = lazy(() => import("./views/Progress/ProgressHub"));
const GamesHub = lazy(() => import("./views/Games/GamesHub"));

function ViewFallback() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "50vh",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        fontWeight: 600,
        color: "var(--text-secondary)",
      }}
    >
      Cargando...
    </div>
  );
}

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
  const { currentUser, loading, effectiveRole } = useAuth();
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
        if (effectiveRole === "student") return <StudentDashboard setActiveTab={setActiveTab} />;
        if (effectiveRole === "teacher") return <TeacherDashboard setActiveTab={setActiveTab} />;
        if (effectiveRole === "admin") return <SuperuserDashboard />;
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
        if (effectiveRole === "student") return <StudentDashboard setActiveTab={setActiveTab} />;
        return <div>Página no encontrada</div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Suspense fallback={<ViewFallback />}>{renderActiveView()}</Suspense>
      </main>
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
