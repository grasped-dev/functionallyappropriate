import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ReportProvider } from './context/ReportContext';
import { MeetingsProvider } from './context/MeetingsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ReportProvider>
          <MeetingsProvider>
            <App />
          </MeetingsProvider>
        </ReportProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);