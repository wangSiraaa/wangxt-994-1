import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PharmacistDashboard from "@/pages/PharmacistDashboard";
import PharmacistPlans from "@/pages/PharmacistPlans";
import PharmacistGroups from "@/pages/PharmacistGroups";
import PharmacistPatients from "@/pages/PharmacistPatients";
import PharmacistRevisit from "@/pages/PharmacistRevisit";
import PharmacistAllergies from "@/pages/PharmacistAllergies";
import PharmacistRestock from "@/pages/PharmacistRestock";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientFeedback from "@/pages/PatientFeedback";
import PatientHistory from "@/pages/PatientHistory";
import ManagerDashboard from "@/pages/ManagerDashboard";
import ManagerOverdue from "@/pages/ManagerOverdue";
import ManagerFocus from "@/pages/ManagerFocus";
import ManagerSupervision from "@/pages/ManagerSupervision";
import BusinessTrails from "@/pages/BusinessTrails";
import Home from "@/pages/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pharmacist" element={<PharmacistDashboard />} />
        <Route path="/pharmacist/plans" element={<PharmacistPlans />} />
        <Route path="/pharmacist/groups" element={<PharmacistGroups />} />
        <Route path="/pharmacist/patients" element={<PharmacistPatients />} />
        <Route path="/pharmacist/revisit" element={<PharmacistRevisit />} />
        <Route path="/pharmacist/allergies" element={<PharmacistAllergies />} />
        <Route path="/pharmacist/restock" element={<PharmacistRestock />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/feedback" element={<PatientFeedback />} />
        <Route path="/patient/history" element={<PatientHistory />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/overdue" element={<ManagerOverdue />} />
        <Route path="/manager/focus" element={<ManagerFocus />} />
        <Route path="/manager/supervision" element={<ManagerSupervision />} />
        <Route path="/trails" element={<BusinessTrails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
