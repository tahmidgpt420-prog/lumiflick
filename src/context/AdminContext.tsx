'use client';

import React, { createContext, useContext, useState } from 'react';

interface AdminContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </AdminContext.Provider>
  );
}
