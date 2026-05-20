import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import Navigation from "./src/navigation";

// TODO: wrap with remaining context providers once each is implemented:
// AppContext (spending), JobContext, FitnessContext, PortfolioContext,
// ClimbingContext, ProjectsContext — same pattern as AuthProvider below.
// Add them all here so every screen has access without prop drilling.

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
