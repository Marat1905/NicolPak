import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Main/Home"
import './index.css'
import AllTamburs from '../src/pages/Prs/AllTamburs'


export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index path="/" element={<Home />} />
                        <Route path="/AllTamburs" element={<AllTamburs />} />
                    </Route>

                </Routes>
            </Router>
        </>
    );
}
