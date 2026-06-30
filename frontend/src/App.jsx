import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import AdminUsers from './pages/AdminUsers';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { background:'#161b2e', color:'#fff', border:'1px solid #1e2d3d', fontSize:'14px' },
                  success: { iconTheme: { primary:'#10b981', secondary:'#fff' } },
                  error: { iconTheme: { primary:'#ef4444', secondary:'#fff' } }
                }}
              />
              <AppRoutes />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
