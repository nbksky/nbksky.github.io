import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";

import PublicLayout from "./components/public/PublicLayout";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Location from "./pages/public/Location";
import ServiceList from "./pages/public/ServiceList";
import ServiceDetail from "./pages/public/ServiceDetail";
import NoticeList from "./pages/public/NoticeList";
import NoticeDetail from "./pages/public/NoticeDetail";
import Consultation from "./pages/public/Consultation";
import NotFound from "./pages/public/NotFound";

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Consultations from "./pages/admin/Consultations";
import NoticesAdmin from "./pages/admin/NoticesAdmin";
import NoticeForm from "./pages/admin/NoticeForm";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import ServiceForm from "./pages/admin/ServiceForm";
import SettingsAdmin from "./pages/admin/SettingsAdmin";

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/location" element={<Location />} />
              <Route path="/services" element={<ServiceList />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/notices" element={<NoticeList />} />
              <Route path="/notices/:id" element={<NoticeDetail />} />
              <Route path="/consultation" element={<Consultation />} />
            </Route>

            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="consultations" element={<Consultations />} />
              <Route path="notices" element={<NoticesAdmin />} />
              <Route path="notices/new" element={<NoticeForm />} />
              <Route path="notices/:id/edit" element={<NoticeForm />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="services/new" element={<ServiceForm />} />
              <Route path="services/:id/edit" element={<ServiceForm />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
