// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App




import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReportForm from "./ReportForm";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";
import FraudList from "./FraudList";
import FraudDetails from "./FraudDetails";
import "./index.css";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link
              to="/"
              className="font-extrabold text-2xl text-blue-600 tracking-tight hover:scale-105 transition-transform"
            >
              FraudWatch
            </Link>
            <nav className="flex gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Report
              </Link>
              <Link
                to="/admin"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Admin
              </Link>
              <Link
  to="/fraudlist"
  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
>
  Fraud List
</Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<ReportForm />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/panel" element={<AdminPanel />} />
              <Route path="/fraudlist" element={<FraudList/>} />
              <Route path="/fraudlist/:id" element={<FraudDetails />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          <p>
            ⚠️ Demo app — Reports are saved in{" "}
            <span className="font-semibold">local storage</span>. Replace with a
            secure backend for production.
          </p>
        </footer>
      </div>
    </Router>
  );
}
