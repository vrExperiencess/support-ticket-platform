import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "../components/layout/AppShell";

import ProtectedRoute from "../guards/ProtectedRoute";

import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import PlaceholderPage from "../pages/PlaceholderPage";
import TicketDetailPage from "../pages/tickets/TicketDetailPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

function getRouterBasename() {
  const base =
    import.meta.env.BASE_URL;

  if (
    !base ||
    base === "/"
  ) {
    return "/";
  }

  return base.replace(
    /\/$/,
    "",
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter
      basename={
        getRouterBasename()
      }
    >
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <DashboardPage />
            }
          />

          {/* TICKETS */}

          <Route
            path="tickets"
            element={
              <ProtectedRoute permission="tickets.read">
                <TicketsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="tickets/new"
            element={
              <ProtectedRoute permission="tickets.create">
                <CreateTicketPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="tickets/:id"
            element={
              <ProtectedRoute permission="tickets.read">
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />

          {/* FUTURE MODULES */}

          <Route
            path="metrics"
            element={
              <ProtectedRoute permission="metrics.read">
                <PlaceholderPage
                  title="Operational metrics"
                  description="Support operation indicators and performance."
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute permission="users.read">
                <PlaceholderPage
                  title="Users"
                  description="System users and role information."
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <PlaceholderPage
                title="My profile"
                description="Authenticated user information."
              />
            }
          />

          <Route
            path="unauthorized"
            element={
              <UnauthorizedPage />
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}