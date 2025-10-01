import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios for API calls

// Removed STORAGE_KEY since we are now using the API

export default function FraudList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await axios.get("http://localhost:5000/api/reports");
        
        // Assuming your backend returns an array of reports directly
        setReports(response.data);
        setError(null); // Clear any previous errors

      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        // Set an error state to display a message to the user
        setError("Could not fetch reports from the server. Please check the backend connection.");
        setReports([]); // Ensure the list is empty on error
        
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    }

    fetchReports();
  }, []); // Empty dependency array means this runs once on component mount

  // --- Rendering Logic ---

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white shadow-2xl rounded-xl p-6 border-t-8 border-red-600">
      <h2 className="text-3xl font-extrabold mb-6 text-red-700 text-center">🚨 Fraud Report List (دھوکہ دہی کی رپورٹیں)</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg text-indigo-600 font-medium">Loading Reports... (رپورٹیں لوڈ ہو رہی ہیں)</p>
          {/* Simple Loading Spinner (using basic Tailwind colors) */}
          <div className="w-8 h-8 border-4 border-t-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mt-3"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
        </div>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-lg font-medium">No frauds reported yet. (ابھی تک کوئی رپورٹ نہیں ملی)</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-100 rounded-lg">
          {reports.map((report, index) => (
            <li key={report._id || report.id || index} className="py-3 sm:py-4">
              <Link
                // Assuming your backend reports have a unique MongoDB '_id' or 'id'
                to={`/fraudlist/${report._id || report.id || index}`}
                className="block hover:bg-red-50 p-3 sm:p-4 rounded-lg transition duration-150 ease-in-out"
              >
                <div className="flex justify-between items-center">
                    <p className="font-bold text-lg text-gray-800 truncate">
                      {report.personName || "Unknown Person"}
                    </p>
                    <span className="text-xs font-medium text-white bg-green-500 px-2 py-0.5 rounded-full">
                        {report.fraudCity || "City N/A"}
                    </span>
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">Business:</span> {report.fraudBusinessName || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Fraud Type:</span> {report.fraudType}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}