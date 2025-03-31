import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SpaceProvider } from "./context/SpaceContext";
import { ReservationProvider } from "./context/ReservationContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SpaceDetails from "./pages/SpaceDetails";
import ReservationForm from "./pages/ReservationForm";
import ReservationDetails from "./pages/ReservationDetails";
import SpaceForm from "./pages/SpaceForm";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <SpaceProvider>
        <ReservationProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spaces/:id"
                  element={
                    <ProtectedRoute>
                      <SpaceDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spaces/new"
                  element={
                    <ProtectedRoute>
                      <SpaceForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spaces/edit/:id"
                  element={
                    <ProtectedRoute>
                      <SpaceForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reservations/new"
                  element={
                    <ProtectedRoute>
                      <ReservationForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reservations/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ReservationForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reservations/:id"
                  element={
                    <ProtectedRoute>
                      <ReservationDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                {/* Add a catch-all route that redirects to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </ReservationProvider>
      </SpaceProvider>
    </AuthProvider>
  );
}

export default App;
