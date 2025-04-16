import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Main/Home"
import './index.css'
import AllTamburs from '../src/pages/Prs/AllTamburs'
import DowntimeByServices from "./pages/Main/DowntimeByServices";
import ShiftWorkAnalysis from "./pages/Main/ShiftWorkAnalysis";
import WorkSchedule from "./pages/Main/WorkSchedule";


export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index path="/" element={<Home />} />
                        <Route index path="/DowntimeByServices" element={<DowntimeByServices />} />
                        <Route index path="/ShiftWorkAnalysis" element={<ShiftWorkAnalysis />} />
                        <Route index path="/WorkSchedule" element={<WorkSchedule />} />
                        <Route path="/AllTamburs" element={<AllTamburs />} />
                    </Route>

                </Routes>
            </Router>
        </>
    );
}
