import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import { DataProvider } from "./providers/DataProvider.tsx";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/typography.css";
import "./styles/layout.css";
import "./styles/utilities.css";

function RootWithAuth() {
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
