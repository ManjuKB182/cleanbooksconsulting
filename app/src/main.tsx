import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ClientDetail } from "./admin/ClientDetail";
import { ClientsList } from "./admin/ClientsList";
import { NewClient } from "./admin/NewClient";
import { Layout } from "./components/Layout";
import { CashFlowDashboard } from "./dashboards/CashFlowDashboard";
import { DashboardsHome } from "./dashboards/DashboardsHome";
import { InvoicesDashboard } from "./dashboards/InvoicesDashboard";
import { PodDashboard } from "./dashboards/PodDashboard";
import { ReconciliationDashboard } from "./dashboards/ReconciliationDashboard";
import { ReturnsDashboard } from "./dashboards/ReturnsDashboard";
import "./index.css";
import { AuthProvider } from "./lib/auth";
import { Login } from "./routes/Login";
import { RequireAuth, RequireStaffAdmin } from "./routes/RequireAuth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboards" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboards"
            element={
              <RequireAuth>
                <Layout>
                  <DashboardsHome />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboards/pod"
            element={
              <RequireAuth>
                <Layout>
                  <PodDashboard />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboards/reconciliation"
            element={
              <RequireAuth>
                <Layout>
                  <ReconciliationDashboard />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboards/invoices"
            element={
              <RequireAuth>
                <Layout>
                  <InvoicesDashboard />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboards/returns"
            element={
              <RequireAuth>
                <Layout>
                  <ReturnsDashboard />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboards/cash-flow"
            element={
              <RequireAuth>
                <Layout>
                  <CashFlowDashboard />
                </Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireStaffAdmin>
                <Layout>
                  <ClientsList />
                </Layout>
              </RequireStaffAdmin>
            }
          />
          <Route
            path="/admin/clients/new"
            element={
              <RequireStaffAdmin>
                <Layout>
                  <NewClient />
                </Layout>
              </RequireStaffAdmin>
            }
          />
          <Route
            path="/admin/clients/:clientId"
            element={
              <RequireStaffAdmin>
                <Layout>
                  <ClientDetail />
                </Layout>
              </RequireStaffAdmin>
            }
          />

          <Route path="*" element={<Navigate to="/dashboards" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
