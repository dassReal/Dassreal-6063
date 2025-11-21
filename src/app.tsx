import RequireAuth from "@/components/RequireAuth";
import RequireAdmin from "@/components/RequireAdmin";
import Billing from "@/pages/billing";
import BillingSuccess from "@/pages/billing-success";
import Chat from "@/pages/chat";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import NftStudio from "@/pages/nft-studio";
import MaterialScience from "@/pages/material-science";
import InnovationHub from "@/pages/innovation-hub";
import CommunityGroups from "@/pages/community-groups";
import Workshops from "@/pages/workshops";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Authentication routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Platform Features */}
        <Route
          path="/nft-studio"
          element={
            <RequireAuth>
              <NftStudio />
            </RequireAuth>
          }
        />
        <Route
          path="/material-science"
          element={
            <RequireAuth>
              <MaterialScience />
            </RequireAuth>
          }
        />
        <Route
          path="/innovation-hub"
          element={
            <RequireAuth>
              <InnovationHub />
            </RequireAuth>
          }
        />
        <Route
          path="/community-groups"
          element={
            <RequireAuth>
              <CommunityGroups />
            </RequireAuth>
          }
        />
        <Route
          path="/workshops"
          element={
            <RequireAuth>
              <Workshops />
            </RequireAuth>
          }
        />

        {/* Billing routes */}
        <Route
          path="/billing"
          element={
            <RequireAuth>
              <Billing />
            </RequireAuth>
          }
        />
        <Route
          path="/billing/success"
          element={
            <RequireAuth>
              <BillingSuccess />
            </RequireAuth>
          }
        />

        {/* Chat routes */}
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
