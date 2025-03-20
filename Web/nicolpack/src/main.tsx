import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <AppWrapper>
                <App />
            </AppWrapper>
        </ThemeProvider>
    </StrictMode>
)
