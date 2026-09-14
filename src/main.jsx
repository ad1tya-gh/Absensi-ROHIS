import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AnggotaPage from './pages/admin/AnggotaPage';
import KegiatanPage from './pages/admin/KegiatanPage';
import KegiatanDetail from './pages/admin/KegiatanDetail';
import JabatanPage from './pages/admin/JabatanPage';
import UserDashboard from './pages/user/UserDashboard';
import AbsenPage from './pages/user/AbsenPage';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/anggota" element={
                        <ProtectedRoute adminOnly>
                            <AnggotaPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/kegiatan" element={
                        <ProtectedRoute adminOnly>
                            <KegiatanPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/kegiatan/:id" element={
                        <ProtectedRoute adminOnly>
                            <KegiatanDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/jabatan" element={
                        <ProtectedRoute adminOnly>
                            <JabatanPage />
                        </ProtectedRoute>
                    } />

                    {/* User Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/absen" element={
                        <ProtectedRoute>
                            <AbsenPage />
                        </ProtectedRoute>
                    } />

                    {/* Redirect root */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
