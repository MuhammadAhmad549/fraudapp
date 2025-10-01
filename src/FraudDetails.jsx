import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function FraudDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get(`http://localhost:5000/api/reports/${id}`);
        setReport(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching report details:", err);
        setError("Failed to load report details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!report) return <p className="text-gray-500">Report not found.</p>;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border-t-8 border-red-600">
      <h2 className="text-2xl font-bold mb-4 text-red-700">🚨 Fraud Details</h2>

      <div className="space-y-2">
        <p><span className="font-semibold">Fraud Name:</span> {report.personName}</p>
        <p><span className="font-semibold">Business:</span> {report.fraudBusinessName}</p>
        <p><span className="font-semibold">City:</span> {report.fraudCity}</p>
        <p><span className="font-semibold">Fraud Type:</span> {report.fraudType}</p>
        <p><span className="font-semibold">Buyer Type:</span> {report.buyerType}</p>
        <p><span className="font-semibold">Reporter:</span> {report.reporterName} ({report.reporterMobile})</p>
        <p><span className="font-semibold">Details:</span> {report.moreDetails}</p>
      </div>

      {/* Image Preview Section */}
      <div className="flex gap-4 mt-6 flex-wrap">
        {report.shopPic && (
          <img
            src={`http://localhost:5000/uploads/${report.shopPic}`}
            alt="Shop"
            className="w-32 h-32 rounded-lg border shadow-md object-cover"
          />
        )}
        {report.manPic && (
          <img
            src={`http://localhost:5000/uploads/${report.manPic}`}
            alt="Person"
            className="w-32 h-32 rounded-lg border shadow-md object-cover"
          />
        )}
        {report.otherPic && (
          <img
            src={`http://localhost:5000/uploads/${report.otherPic}`}
            alt="Other"
            className="w-32 h-32 rounded-lg border shadow-md object-cover"
          />
        )}
      </div>

      <Link
        to="/fraudlist"
        className="inline-block mt-6 text-blue-600 font-medium hover:underline"
      >
        ← Back to List
      </Link>
    </div>
  );
}
