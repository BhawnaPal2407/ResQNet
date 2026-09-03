import { Routes, Route } from "react-router-dom";

// Pages — public
import Landing        from "./pages/Landing.jsx";
import Login          from "./pages/Login.jsx";
import Signup         from "./pages/Signup.jsx";
import About          from "./pages/About.jsx";
import Contact        from "./pages/Contact.jsx";
import BloodDonors    from "./pages/BloodDonors.jsx";
import Volunteers     from "./pages/Volunteers.jsx";

// Pages — protected
import Home            from "./pages/Home.jsx";
import EmergencyRequest from "./pages/EmergencyRequest.jsx";
import BloodRequest    from "./pages/BloodRequest.jsx";
import DonorRegister   from "./pages/DonorRegister.jsx";
import LiveMap         from "./pages/LiveMap.jsx";
import Tracking        from "./pages/Tracking.jsx";
import TrackBloodRequest from "./pages/TrackBloodRequest.jsx";
import TrackEmergency  from "./pages/TrackEmergency.jsx";
import MyRequests      from "./pages/MyRequests.jsx";
import Profile         from "./pages/Profile.jsx";

// Pages — admin
import AdminDashboardHome from "./pages/admin/AdminDashboardHome.jsx";
import AdminUsers         from "./pages/admin/AdminUsers.jsx";
import AdminBloodDonors   from "./pages/admin/AdminBloodDonors.jsx";
import AdminBloodRequests from "./pages/admin/AdminBloodRequests.jsx";
import AdminEmergencies   from "./pages/admin/AdminEmergencies.jsx";
import AdminVolunteers    from "./pages/admin/AdminVolunteers.jsx";
import AdminNgos          from "./pages/admin/AdminNgos.jsx";

// Guards
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute     from "./components/AdminRoute.jsx";

function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/signup"    element={<Signup />} />
      <Route path="/about"     element={<About />} />
      <Route path="/contact"   element={<Contact />} />
      <Route path="/blood-donors" element={<BloodDonors />} />
      <Route path="/volunteers"   element={<Volunteers />} />

      {/* ── Protected ── */}
      <Route path="/home"              element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/emergency-request" element={<ProtectedRoute><EmergencyRequest /></ProtectedRoute>} />
      <Route path="/blood-request"     element={<ProtectedRoute><BloodRequest /></ProtectedRoute>} />
      <Route path="/donor-register"    element={<ProtectedRoute><DonorRegister /></ProtectedRoute>} />
      <Route path="/live-map"          element={<ProtectedRoute><LiveMap /></ProtectedRoute>} />
      <Route path="/my-requests"       element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
      <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Tracking — separate pages per request type */}
      <Route path="/tracking/blood/:id"     element={<ProtectedRoute><TrackBloodRequest /></ProtectedRoute>} />
      <Route path="/tracking/emergency/:id" element={<ProtectedRoute><TrackEmergency /></ProtectedRoute>} />
      {/* Legacy route — keep for any old links */}
      <Route path="/tracking/:requestId"    element={<ProtectedRoute><Tracking /></ProtectedRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin"                    element={<AdminRoute><AdminDashboardHome /></AdminRoute>} />
      <Route path="/admin/users"              element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/blood-donors"       element={<AdminRoute><AdminBloodDonors /></AdminRoute>} />
      <Route path="/admin/blood-requests"     element={<AdminRoute><AdminBloodRequests /></AdminRoute>} />
      <Route path="/admin/emergency-requests" element={<AdminRoute><AdminEmergencies /></AdminRoute>} />
      <Route path="/admin/volunteers"         element={<AdminRoute><AdminVolunteers /></AdminRoute>} />
      <Route path="/admin/ngos"               element={<AdminRoute><AdminNgos /></AdminRoute>} />
    </Routes>
  );
}

export default App;
