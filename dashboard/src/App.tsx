import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CollaboratorProvider } from "./context/CollaboratorContext";
import { Flex } from "@radix-ui/themes";
import { ToastContainer } from "@/components";

// Layout
// import Layout from './components/Layout'
import { Layout } from "@/components";
// Pages
// import Login from './pages/Login'
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppDetails from "./pages/AppDetails";
import DeploymentDetails from "./pages/DeploymentDetails";
import NotFound from "./pages/NotFound";
import { PrivateRoute } from "@/components";
import QRCodePage from "./pages/QRCodePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <AuthProvider>
      <CollaboratorProvider>
        <Flex direction="column" style={{ minHeight: "100vh" }}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/apps" replace />} />
              <Route
                path="apps"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="apps/:appName"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AppDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="apps/:appName/deployments/:deploymentName"
                element={
                  <PrivateRoute requiredRole="admin">
                    <DeploymentDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="qrcode"
                element={
                  <PrivateRoute>
                    <QRCodePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="qrcodes"
                element={
                  <PrivateRoute>
                    <QRCodePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast notifications container */}
          <ToastContainer />
        </Flex>
      </CollaboratorProvider>
    </AuthProvider>
  );
}

export default App;
