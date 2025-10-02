import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "toasticom";
import { Search, AlertTriangle, MapPin, Briefcase, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";

export default function FraudList() {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: limit,
          ...(debouncedSearch && { search: debouncedSearch })
        });

        const response = await axios.get(`http://localhost:5000/api/reports?${params}`);

        setReports(response.data.reports || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);

      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        toast("error", "Could not fetch reports from the server. Please check your connection.");
        setReports([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [currentPage, debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) range.push(i);
        range.push('...');
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
        range.push('...');
        range.push(totalPages);
      }
    }

    return range;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Fraud Reports</h1>
        </div>
        <p className="text-gray-600 text-sm">
          دھوکہ دہی کی رپورٹیں - Browse and search reported fraud cases
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, business, or location..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        {debouncedSearch && (
          <p className="text-sm text-gray-600 mt-2">
            Searching for: <span className="font-semibold">"{debouncedSearch}"</span>
          </p>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-medium">Loading Reports...</p>
            <p className="text-sm text-gray-500 mt-1">رپورٹیں لوڈ ہو رہی ہیں</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-medium">No fraud reports found</p>
            <p className="text-sm text-gray-500 mt-1">ابھی تک کوئی رپورٹ نہیں ملی</p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(currentPage - 1) * limit + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(currentPage * limit, total)}</span> of{" "}
                <span className="font-semibold">{total}</span> results
              </p>
            </div>

            {/* Reports List */}
            <div className="space-y-3 mb-6">
              {reports.map((report, index) => (
                <Link
                  key={report._id || report.id || index}
                  to={`/fraudlist/${report._id || report.id || index}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {report.personName || "Unknown Person"}
                        </h3>
                        <span className="flex-shrink-0 text-xs font-medium text-white bg-red-500 px-2 py-1 rounded-full">
                          {report.fraudType || "Fraud"}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            <span className="font-medium">Business:</span> {report.fraudBusinessName || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            <span className="font-medium">Location:</span> {report.fraudCity || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {getPaginationRange().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}