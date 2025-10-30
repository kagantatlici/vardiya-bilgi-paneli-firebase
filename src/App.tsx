import React from "react";
import MainScreen from "./components/MainScreen";
import AdminLinkPage from "./components/AdminLinkPage";

const App: React.FC = () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/admin/link') {
    return <AdminLinkPage />;
  }
  return <MainScreen />;
};

export default React.memo(App);
