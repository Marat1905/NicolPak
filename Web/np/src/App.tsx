import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Main/Home"
import './index.css'
import AllTamburs from '../src/pages/Prs/AllTamburs'
import DowntimeByServices from "./pages/Main/DowntimeByServices";


export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index path="/" element={<Home />} />
                        <Route index path="/DowntimeByServices" element={<DowntimeByServices />} />
                        <Route path="/AllTamburs" element={<AllTamburs />} />
                    </Route>

                </Routes>
            </Router>
        </>
    );
}
