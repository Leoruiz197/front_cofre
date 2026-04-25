import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Rules from "../pages/Rules";
import RegisterPlayer from "../pages/RegisterPlayer";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<RegisterPlayer />} />
        <Route path="/rules" element={<Rules />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;