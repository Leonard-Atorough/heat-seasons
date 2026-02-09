import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import { useAuthToken } from "./hooks/useAuthToken.ts";
import { DataProvider } from "./providers/DataProvider.tsx";

function RootWithAuth() {
  useAuthToken();
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <RootWithAuth />
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>,
);
