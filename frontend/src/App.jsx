import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Home, Directory, Categories, Detail } from "./pages/PublicPages";
import {
  Login,
  Register,
  Profile,
  ChatList,
  ChatRoom,
} from "./pages/AccountPages";
import {
  AdminHome,
  AdminHelplines,
  AdminCategories,
  AdminUsers,
  AdminConversations,
} from "./pages/AdminPages";
import { Spinner } from "./components/UI";
function Gate({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
function Routed() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="helplines" element={<Directory />} />
        <Route path="helplines/:id" element={<Detail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="profile"
          element={
            <Gate>
              <Profile />
            </Gate>
          }
        />
        <Route
          path="chat"
          element={
            <Gate>
              <ChatList />
            </Gate>
          }
        />
        <Route
          path="chat/:id"
          element={
            <Gate>
              <ChatRoom />
            </Gate>
          }
        />
        <Route
          path="admin"
          element={
            <Gate admin>
              <AdminHome />
            </Gate>
          }
        />
        <Route
          path="admin/helplines"
          element={
            <Gate admin>
              <AdminHelplines />
            </Gate>
          }
        />
        <Route
          path="admin/categories"
          element={
            <Gate admin>
              <AdminCategories />
            </Gate>
          }
        />
        <Route
          path="admin/users"
          element={
            <Gate admin>
              <AdminUsers />
            </Gate>
          }
        />
        <Route
          path="admin/conversations"
          element={
            <Gate admin>
              <AdminConversations />
            </Gate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routed />
      </AuthProvider>
    </BrowserRouter>
  );
}
