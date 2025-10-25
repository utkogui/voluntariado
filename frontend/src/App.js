import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles, theme } from './styles/GlobalStyles';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Opportunities from './pages/Opportunities/Opportunities';
import OpportunityDetail from './pages/Opportunities/OpportunityDetail';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';
import Notifications from './pages/Notifications/Notifications';
import Schedule from './pages/Schedule/Schedule';
import Evaluations from './pages/Evaluations/Evaluations';
import Reports from './pages/Reports/Reports';
import Analytics from './pages/Analytics/Analytics';
import NotFound from './pages/NotFound/NotFound';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <Routes>
          {/* Rotas públicas sem layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Rotas protegidas com layout */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/opportunities" element={
            <PrivateRoute>
              <Layout>
                <Opportunities />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/opportunities/:id" element={
            <PrivateRoute>
              <Layout>
                <OpportunityDetail />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/chat" element={
            <PrivateRoute>
              <Layout>
                <Chat />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/notifications" element={
            <PrivateRoute>
              <Layout>
                <Notifications />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/schedule" element={
            <PrivateRoute>
              <Layout>
                <Schedule />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/evaluations" element={
            <PrivateRoute>
              <Layout>
                <Evaluations />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/reports" element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/analytics" element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <Layout>
                <Analytics />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* Rota 404 */}
          <Route path="*" element={
            <Layout showSidebar={false}>
              <NotFound />
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
