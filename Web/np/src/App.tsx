import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Main/Home"
import './index.css'
import AllTamburs from '../src/pages/Prs/AllTamburs'
import DowntimeByServices from "./pages/Main/DowntimeByServices";
import ShiftWorkAnalysis from "./pages/Main/ShiftWorkAnalysis";
import ProductionPlan from "./pages/Main/ProductionPlan";
import DowntimeByServicesYear from "./pages/Reports/DowntimeByServicesYear";
import ReportBDM from "./pages/Reports/ReportBDM";
import ReportProduction from "./pages/Reports/ReportProduction";
import ReportProd from "./pages/Reports/ReportProd";

import WorkSchedule from "./pages/Main/WorkSchedule";

import WaterPage from "./pages/EnergyAccounting/Water/WaterPage";
import BirthdayPage from "./pages/Main/BirthdayPage";
import WaterNodesReport from "./pages/EnergyAccounting/Water/WaterNodesReport";
import WaterPeriodReport from "./pages/EnergyAccounting/Water/WaterPeriodReport";
import BoilerReport from "./pages/EnergyAccounting/Boiler/BoilerReport";
import ASKUEReport from "./pages/ASKUE/ASKUEReport";
import MonthlyReport from "./pages/Reports/MonthlyReport";
import VibrationTemperatureMonitoring from "./pages/Reports/VibrationTemperatureMonitoring";
import PaperMachineDashboard from "./pages/Main/PaperMachineDashboard";



export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index path="/" element={<Home />} />
                        <Route index path="/PaperMachineDashboard" element={<PaperMachineDashboard />} />
                        <Route index path="/DowntimeByServices" element={<DowntimeByServices />} />
                        <Route index path="/ShiftWorkAnalysis" element={<ShiftWorkAnalysis />} />
                        <Route index path="/WorkSchedule" element={<WorkSchedule />} />
                        <Route index path="/ProductionPlan" element={<ProductionPlan />} />
                        <Route index path="/Birthday" element={<BirthdayPage />} />

                        <Route index path="/Water" element={<WaterPage />} />
                        <Route index path="/WaterNodesReport" element={<WaterNodesReport />} />
                        <Route index path="/WaterPeriodReport" element={<WaterPeriodReport />} />

                        <Route index path="/BoilerReport" element={<BoilerReport />} />

                        <Route index path="/ASKUEReport" element={<ASKUEReport />} />


                        <Route path="/AllTamburs" element={<AllTamburs />} />

                        <Route index path="/DowntimeByServicesYear" element={<DowntimeByServicesYear />} />
                        <Route index path="/ReportBDM" element={<ReportBDM />} />
                        <Route index path="/MonthlyReport" element={<MonthlyReport />} />
                        <Route index path="/ReportProduction" element={<ReportProduction />} />
                        <Route index path="/ReportProd" element={<ReportProd />} />
                        VibrationTemperatureMonitoring
                        <Route index path="/VibrationTemperatureMonitoring" element={<VibrationTemperatureMonitoring />} />

                    </Route>

                </Routes>
            </Router>
        </>
    );
}
