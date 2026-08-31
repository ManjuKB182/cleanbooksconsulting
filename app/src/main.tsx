import { lazy, StrictMode, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ClientDetail } from "./admin/ClientDetail";
import { ClientsList } from "./admin/ClientsList";
import { NewClient } from "./admin/NewClient";
import { DashboardShell } from "./components/DashboardShell";
import { Layout } from "./components/Layout";
import { DashboardIndex } from "./dashboards/DashboardIndex";
import { PodDashboard } from "./dashboards/PodDashboard";
import "./index.css";
import { AuthProvider } from "./lib/auth";
import { Login } from "./routes/Login";
import { RequireClientViewer, RequireStaffAdmin } from "./routes/RequireAuth";
import { RoleHome } from "./routes/RoleHome";

// recharts is sizeable — code-split it out of the initial bundle (login/admin never need it).
const ReconciliationDashboard = lazy(() => import("./dashboards/ReconciliationDashboard").then((m) => ({ default: m.ReconciliationDashboard })));
const InvoicesDashboard = lazy(() => import("./dashboards/InvoicesDashboard").then((m) => ({ default: m.InvoicesDashboard })));
const ReturnsDashboard = lazy(() => import("./dashboards/ReturnsDashboard").then((m) => ({ default: m.ReturnsDashboard })));
const CashFlowDashboard = lazy(() => import("./dashboards/CashFlowDashboard").then((m) => ({ default: m.CashFlowDashboard })));

function ChartPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p className="muted">Loading…</p>}>{children}</Suspense>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboards"
            element={
              <RequireClientViewer>
                <DashboardShell />
              </RequireClientViewer>
            }
          >
            <Route index element={<DashboardIndex />} />
            <Route path="pod" element={<PodDashboard />} />
            <Route
              path="reconciliation"
              element={
                <ChartPage>
                  <ReconciliationDashboard />
                </ChartPage>
              }
            />
            <Route
              path="invoices"
              element={
                <ChartPage>
                  <InvoicesDashboard />
                </ChartPage>
              }
            />
            <Route
              path="returns"
              element={
                <ChartPage>
                  <ReturnsDashboard />
                </ChartPage>
              }
            />
            <Route
              path="cash-flow"
              element={
                <ChartPage>
                  <CashFlowDashboard />
                </ChartPage>
              }
            />
          </Route>

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

          <Route path="*" element={<RoleHome />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
