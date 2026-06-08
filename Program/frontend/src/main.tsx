import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PlatformAdminProvider } from "./context/PlatformAdminContext";
import "./stylesheets/AppBase.css";
import "./stylesheets/PageShell.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <PlatformAdminProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </PlatformAdminProvider>
        </AuthProvider>
    </React.StrictMode>
);
