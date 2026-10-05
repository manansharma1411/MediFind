import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MedicineDetailsPage from './pages/MedicineDetailsPage';
import PharmacyDetailsPage from './pages/PharmacyDetailsPage';
import ReservationConfirmationPage from './pages/ReservationConfirmationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import MedicalDisclaimer from './components/MedicalDisclaimer';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<HomePage />} />
              <Route path="/medicines/:id" element={<MedicineDetailsPage />} />
              <Route path="/medicine/:id" element={<MedicineDetailsPage />} />
              <Route path="/medicine/:id/availability" element={<MedicineDetailsPage />} />
              <Route path="/pharmacy/:id" element={<PharmacyDetailsPage />} />
              <Route path="/reservation/:id" element={<ReservationConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/*" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
            <MedicalDisclaimer />
            <p className="font-semibold text-slate-700">MediFind — Medicine Availability Finder</p>
            <p className="text-slate-400">Bhopal, Madhya Pradesh, India</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
