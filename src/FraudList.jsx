"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "toasticom"
import { Search, AlertTriangle, MapPin, Briefcase, ChevronLeft, ChevronRight, Loader2, Clock, X } from "lucide-react"
import axios from "axios"

export default function FraudList() {
  const [reports, setReports] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [remainingTime, setRemainingTime] = useState(null)
  const [city, setCity] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otpInput, setOtpInput] = useState("")
  const [validatingOtp, setValidatingOtp] = useState(false)
  const navigate = useNavigate()

  const limit = 10
  const sessionStartTime = useRef(null)
  const hasCheckedOtp = useRef(false)
  const isUpdatingReadTime = useRef(false)
  const componentMounted = useRef(false)

  // Check localStorage for OTP on mount
  useEffect(() => {
    if (hasCheckedOtp.current) return
    hasCheckedOtp.current = true
    componentMounted.current = true

    const storedOtp = localStorage.getItem("userOtp")
    const storedCity = localStorage.getItem("userCity")

    if (storedOtp) {
      setOtpValue(storedOtp)
      if (storedCity) {
        setCity(storedCity)
      }
      // Initialize session start time for existing OTP
      sessionStartTime.current = Date.now()
      console.log("✅ Loaded existing OTP from localStorage, session started")
    } else {
      setShowOtpDialog(true)
    }
  }, [])

  // Validate and submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault()

    if (!otpInput.trim()) {
      toast("error", "Please enter an OTP")
      return
    }

    setValidatingOtp(true)

    try {
      const response = await axios.post("http://localhost:5000/api/otp/validate-otp", {
        otpValue: otpInput,
      })

      const { city: otpCity, token } = response.data

      // Store OTP and city in localStorage
      localStorage.setItem("userOtp", otpInput)
      localStorage.setItem("userCity", otpCity)
      localStorage.setItem("userToken", token)

      setOtpValue(otpInput)
      setCity(otpCity)
      setShowOtpDialog(false)

      toast("success", `Welcome! Access granted for ${otpCity}`)

      // IMPORTANT: Initialize session start time AFTER successful OTP validation
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        sessionStartTime.current = Date.now()
        componentMounted.current = true
        console.log("✅ New OTP validated, session started at:", new Date().toISOString())
      }, 100)
    } catch (err) {
      console.error("OTP validation error:", err)

      if (err.response?.status === 401) {
        toast("error", err.response.data.message || "Invalid or expired OTP")
      } else {
        toast("error", "Failed to validate OTP. Please try again.")
      }
    } finally {
      setValidatingOtp(false)
    }
  }

  // Close OTP dialog (browse without OTP)
  const handleBrowseWithoutOtp = () => {
    setShowOtpDialog(false)
    setOtpValue("")
    sessionStartTime.current = null
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch reports
  useEffect(() => {
    async function fetchReports() {
      if (!otpValue) return // 🔒 Stop if there's no OTP

      try {
        setLoading(true)

        const params = new URLSearchParams({
          page: currentPage,
          limit: limit,
          ...(debouncedSearch && { search: debouncedSearch }),
          otp: otpValue,
        })

        const endpoint = `http://localhost:5000/api/reports/getByOtp?${params}`
        const response = await axios.get(endpoint)

        setReports(response.data.reports || [])
        setTotalPages(response.data.totalPages || 1)
        setTotal(response.data.total || 0)

        if (response.data.remainingTime !== undefined) {
          setRemainingTime(response.data.remainingTime)
          setCity(response.data.city || city)
        }
      } catch (err) {
        console.error("❌ Error fetching reports:", err)

        if (err.response?.status === 403) {
          toast("error", "Read time limit exceeded. You have no time left.")
        } else if (err.response?.status === 401) {
          toast("error", "Invalid or expired OTP.")
        } else {
          toast("error", "Could not fetch reports from the server. Please check your connection.")
        }

        // 🧹 Cleanup on error
        localStorage.removeItem("userOtp")
        localStorage.removeItem("userCity")
        localStorage.removeItem("userToken")
        setOtpValue("")
        setShowOtpDialog(true)
        sessionStartTime.current = null
        setReports([])
        setTotalPages(1)
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    // ✅ Only fetch when OTP exists & dialog not shown
    if (!showOtpDialog && otpValue) {
      fetchReports()
    }
  }, [currentPage, debouncedSearch, otpValue, showOtpDialog])

  // Update read time - consolidated single useEffect
  useEffect(() => {
    if (!otpValue || !sessionStartTime.current) return

    const sendReadTimeUpdate = async () => {
      if (!sessionStartTime.current || !componentMounted.current) return;

      const sessionEndTime = Date.now();
      const sessionMinutes = Math.floor((sessionEndTime - sessionStartTime.current) / 60000);
      if (sessionMinutes < 1) return;

      const safeSessionMinutes = Math.min(sessionMinutes, 30);

      try {
        await fetch("http://localhost:5000/api/otp/update-read-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otpValue,
            sessionMinutes: safeSessionMinutes,
          }),
          keepalive: true, // ✅ works during unload
        });
        console.log(`✅ Sent read time update via fetch (${safeSessionMinutes} mins)`);
      } catch (err) {
        console.error("❌ Read time update failed:", err);
      }
    };


    const handleBeforeUnload = () => {
      sendReadTimeUpdate()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("👁️ Page hidden - updating read time")
        sendReadTimeUpdate()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      // Send final update when component unmounts
      sendReadTimeUpdate()
    }
  }, [otpValue])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const getPaginationRange = () => {
    const range = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) range.push(i)
        range.push("...")
        range.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        range.push(1)
        range.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) range.push(i)
      } else {
        range.push(1)
        range.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i)
        range.push("...")
        range.push(totalPages)
      }
    }

    return range
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* OTP Dialog Modal */}
      {showOtpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-600 text-sm">Enter your OTP to access city-specific fraud reports</p>
              <p className="text-gray-500 text-xs mt-1">اپنے شہر کی رپورٹس دیکھنے کے لیے OTP درج کریں</p>
            </div>

            <form onSubmit={handleOtpSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-semibold"
                  maxLength={6}
                  disabled={validatingOtp}
                />
              </div>

              <button
                type="submit"
                disabled={validatingOtp}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {validatingOtp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              {/* <button
                type="button"
                onClick={handleBrowseWithoutOtp}
                className="w-full mt-3 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Browse without OTP
              </button> */}
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Fraud Reports</h1>
            </div>
            <p className="text-gray-600 text-sm">
              دھوکہ دہی کی رپورٹیں - Browse and search reported fraud cases
              {city && <span className="font-semibold ml-1">({city})</span>}
            </p>
          </div>

          {/* Remaining Time Display */}
          {remainingTime !== null && otpValue && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                <div className="font-semibold text-blue-900">{remainingTime} min</div>
                <div className="text-blue-600 text-xs">remaining</div>
              </div>
            </div>
          )}
        </div>
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
                  to={`/fraudlist/${report._id || report.id || index}${otpValue ? `?otp=${otpValue}` : ""}`}
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
                  {getPaginationRange().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
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
  )
}
