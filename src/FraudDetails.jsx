import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, User, Building, Phone, MapPin, CreditCard, AlertTriangle, Image, Calendar, CheckCircle } from "lucide-react";

export default function FraudDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const navigate = useNavigate();

  const sessionStartTime = useRef(Date.now());

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

  const sendReadTimeUpdate = async () => {
    const otpValue = localStorage.getItem("userOtp");
    if (!otpValue || !sessionStartTime.current) return;

    const sessionMinutes = Math.floor((Date.now() - sessionStartTime.current) / 60000);
    if (sessionMinutes < 1) return;

    const safeSessionMinutes = Math.min(sessionMinutes, 30);

    try {
      await fetch("http://localhost:5000/api/otp/update-read-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpValue, sessionMinutes: safeSessionMinutes }),
        keepalive: true,
      });
      console.log(`✅ Sent read time update (${safeSessionMinutes} mins)`);
    } catch (err) {
      console.error("❌ Failed to send read time update:", err);
    }
  };


  useEffect(() => {
    const handleBeforeUnload = () => sendReadTimeUpdate();
    const handleVisibilityChange = () => {
      if (document.hidden) sendReadTimeUpdate();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sendReadTimeUpdate();
    };
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoRow = ({ icon: Icon, label, value, highlight = false }) => {
    if (!value) return null;
    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlight ? 'text-red-600' : 'text-gray-600'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-0.5">{label}</p>
          <p className={`text-base font-semibold ${highlight ? 'text-red-700' : 'text-gray-900'} break-words`}>{value}</p>
        </div>
      </div>
    );
  };

  const ImageCard = ({ src, label, onClick }) => {
    if (!src) return null;
    return (
      <div className="relative group cursor-pointer" onClick={() => onClick(src)}>
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-500 transition-all">
          <img
            src={src}
            alt={label}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
        <p className="text-sm font-medium text-gray-700 mt-2 text-center">{label}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-700 font-medium">Report not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border-t-8 border-red-600">
          <div className={`px-6 py-4 ${report.isApproved ? 'bg-green-50' : 'bg-yellow-50'} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {report.isApproved ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-semibold text-gray-900">
                  Status: {report.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
              <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                {report.status || 'new'}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-2xl font-bold text-red-900 mb-1">Fraud Report</h1>
                  <p className="text-red-700 font-medium">{report.fraudType}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Reporter Information
              </h2>
              <div className="grid gap-3">
                <InfoRow icon={User} label="Reporter Name" value={report.reporterName} />
                <InfoRow icon={Building} label="Business Name" value={report.reporterBusiness} />
                <InfoRow icon={Phone} label="Mobile Number" value={report.reporterMobile} />
                {report.reporterVisitingCard && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Visiting Card</p>
                    <img
                      src={report.reporterVisitingCard}
                      alt="Visiting Card"
                      className="w-full max-w-md rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-all"
                      onClick={() => setImageModal(report.reporterVisitingCard)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Fraud Subject Details
              </h2>
              <div className="grid gap-3">
                <InfoRow icon={User} label="Person Name" value={report.personName} highlight />
                <InfoRow icon={Building} label="Business Name" value={report.fraudBusinessName} highlight />
                <InfoRow icon={User} label="Buyer Type" value={report.buyerType} />

                {report.fraudMobile && (
                  <InfoRow icon={Phone} label="Primary Mobile" value={report.fraudMobile} highlight />
                )}
                {report.fraudMobile1 && (
                  <InfoRow icon={Phone} label="Mobile 1" value={report.fraudMobile1} highlight />
                )}
                {report.fraudMobile2 && (
                  <InfoRow icon={Phone} label="Mobile 2" value={report.fraudMobile2} highlight />
                )}
                {report.fraudMobile3 && (
                  <InfoRow icon={Phone} label="Mobile 3" value={report.fraudMobile3} highlight />
                )}

                <InfoRow icon={MapPin} label="Province" value={report.fraudProvince} />
                <InfoRow icon={MapPin} label="City" value={report.fraudCity} />
                {report.customCity && (
                  <InfoRow icon={MapPin} label="Custom City" value={report.customCity} />
                )}

                {(report.cnicNumber || report.cninNumber) && (
                  <InfoRow
                    icon={CreditCard}
                    label="CNIC Number"
                    value={report.cnicNumber || report.cninNumber}
                    highlight
                  />
                )}
              </div>
            </div>

            {report.moreDetails && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{report.moreDetails}</p>
                </div>
              </div>
            )}

            {(report.shopPic || report.manPic || report.otherPic) && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Evidence Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ImageCard src={report.shopPic} label="Shop Picture" onClick={setImageModal} />
                  <ImageCard src={report.manPic} label="Person Picture" onClick={setImageModal} />
                  <ImageCard src={report.otherPic} label="Other Picture" onClick={setImageModal} />
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(report.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Updated:</span>
                  <span>{formatDate(report.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {imageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setImageModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-bold"
            >
              ×
            </button>
            <img
              src={imageModal}
              alt="Enlarged view"
              className="max-w-full max-h-screen rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}