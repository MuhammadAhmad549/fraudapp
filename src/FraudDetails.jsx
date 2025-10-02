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
    <div className="bg-white shadow-lg rounded-2xl p-6 border-t-8 border-red-600 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-700">🚨 Fraud Report Details</h2>

      {/* Report Metadata */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Report Info</h3>
        <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-sm ${report.status === 'new' ? 'bg-yellow-100 text-yellow-800' : report.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{report.status}</span></p>
        <p><span className="font-medium">Reported On:</span> {new Date(report.createdAt).toLocaleDateString()}</p>
        {report.updatedAt && report.updatedAt !== report.createdAt && (
          <p><span className="font-medium">Last Updated:</span> {new Date(report.updatedAt).toLocaleDateString()}</p>
        )}
      </div>

      {/* Reporter Details Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">1. Reporter Details</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Name:</span> {report.reporterName}</p>
          {report.reporterBusiness && <p><span className="font-medium">Business:</span> {report.reporterBusiness}</p>}
          <p><span className="font-medium">Mobile:</span> {report.reporterMobile}</p>
        </div>
      </div>

      {/* Fraud Details Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">2. Fraud Details</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Fraud Type:</span> {report.fraudType}</p>
          <p><span className="font-medium">Buyer Type:</span> {report.buyerType}</p>
          <p><span className="font-medium">Person Name:</span> {report.personName}</p>
          <p><span className="font-medium">Fraud Mobile:</span> {report.fraudMobile}</p>
          {report.fraudBusinessName && <p><span className="font-medium">Fraud Business:</span> {report.fraudBusinessName}</p>}
          <p><span className="font-medium">City:</span> {report.fraudCity}</p>
          {report.customCity && <p><span className="font-medium">Custom Location:</span> {report.customCity}</p>}
          <p><span className="font-medium">CNIC:</span> {report.cninNumber}</p>
          <p><span className="font-medium">Description:</span> {report.moreDetails}</p>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">3. Evidence</h3>
        {report.reporterVisitingCard && (
          <div className="mb-4">
            <p className="font-medium mb-2">Reporter Visiting Card:</p>
            <img
              src={report.reporterVisitingCard}
              alt="Visiting Card"
              className="w-full max-w-xs h-auto rounded-lg border shadow-md object-cover"
            />
          </div>
        )}
        <div className="flex gap-4 flex-wrap">
          {report.shopPic && (
            <div className="flex-1 min-w-[150px]">
              <p className="font-medium text-xs mb-1">Shop/Location Photo</p>
              <img
                src={report.shopPic}
                alt="Shop"
                className="w-full max-w-[200px] h-48 rounded-lg border shadow-md object-cover"
              />
            </div>
          )}
          {report.manPic && (
            <div className="flex-1 min-w-[150px]">
              <p className="font-medium text-xs mb-1">Person Photo</p>
              <img
                src={report.manPic}
                alt="Person"
                className="w-full max-w-[200px] h-48 rounded-lg border shadow-md object-cover"
              />
            </div>
          )}
          {report.otherPic && (
            <div className="flex-1 min-w-[150px]">
              <p className="font-medium text-xs mb-1">Other Evidence</p>
              <img
                src={report.otherPic}
                alt="Other"
                className="w-full max-w-[200px] h-48 rounded-lg border shadow-md object-cover"
              />
            </div>
          )}
        </div>
        {(!report.shopPic && !report.manPic && !report.otherPic && !report.reporterVisitingCard) && (
          <p className="text-gray-500 text-sm italic">No images provided.</p>
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