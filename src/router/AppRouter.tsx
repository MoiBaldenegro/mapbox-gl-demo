import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../ui/Header';
import CustomerView from '../views/customer-view';

export const AppRouter = () => {
  return (
    <BrowserRouter>
    <Header logo="🐝 Busbee" />
      <Routes>
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/register" element={<RegisterPage/>} /> */}
        
        {/* <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        /> */}
        <Route path="/" element={<CustomerView />} />
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
