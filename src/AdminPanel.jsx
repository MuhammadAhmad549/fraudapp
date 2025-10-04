import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'toasticom';
import {
  Shield, Search, Filter, LogOut, Home, Edit, Trash2, Loader2,
  User, Phone, Briefcase, MapPin, AlertTriangle, Calendar,
  ChevronLeft, ChevronRight, X, FileText, Image as ImageIcon,
  Eye,
  Key
} from 'lucide-react';
import axios from 'axios';

// Modal Component
function Modal({ isOpen, onClose, title, children, icon: Icon }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6 text-red-600" />}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  'new': 'bg-red-100 text-red-800 border-red-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'closed': 'bg-green-100 text-green-800 border-green-300',
};

const STATUS_BADGE = {
  'new': 'New',
  'in-progress': 'In Progress',
  'closed': 'Closed',
};

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reportId: null, reportName: '' });
  const [statusModal, setStatusModal] = useState({ isOpen: false, reportId: null, newStatus: '', reportName: '' });
  const navigate = useNavigate();
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(filter !== 'all' && { status: filter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await axios.get(`http://localhost:5000/api/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(res.data.reports || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast('error', 'Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if admin is logged in and fetch reports
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    } else {
      fetchReports();
    }
  }, [navigate, currentPage, filter, debouncedSearch]);

  // Open status confirmation modal
  const openStatusModal = (id, status, name) => {
    setStatusModal({ isOpen: true, reportId: id, newStatus: status, reportName: name });
  };

  // Update status via API
  const confirmStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/reports/${statusModal.reportId}`,
        { status: statusModal.newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast('success', `Status updated to "${STATUS_BADGE[statusModal.newStatus]}" successfully!`);
      setStatusModal({ isOpen: false, reportId: null, newStatus: '', reportName: '' });
      fetchReports();
    } catch (err) {
      console.error('Error updating status:', err);
      toast('error', 'Failed to update status. Please try again.');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, reportId: id, reportName: name });
  };

  // Delete report via API
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reports/${deleteModal.reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast('success', 'Report deleted successfully!');
      setDeleteModal({ isOpen: false, reportId: null, reportName: '' });
      fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      toast('error', 'Failed to delete report. Please try again.');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

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

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    toast('success', 'Logged out successfully!');
    navigate('/');
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Page {currentPage} of {totalPages} • {total} total reports</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/otp"
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                <Key className="w-4 h-4" />
                Manage OTP
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                <Home className="w-4 h-4" />
                Go to Form
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-red-300 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reporter name, person name, or business..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none transition appearance-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No reports found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6 border-b border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{r.personName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          {r.fraudCity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 ml-9">
                      <Briefcase className="w-4 h-4" />
                      Business: {r.fraudBusinessName || 'N/A'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_BADGE[r.status]}
                    </span>
                    <select
                      value={r.status}
                      onChange={(e) => openStatusModal(r._id, e.target.value, r.personName)}
                      className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="new">Mark as New</option>
                      <option value="in-progress">Mark In Progress</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                  {/* Reporter Info */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
                      <User className="w-5 h-5" />
                      Reporter Info
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Name:</span> {r.reporterName || 'N/A'}</p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {r.reporterMobile || 'N/A'}
                      </p>
                      <p><span className="font-medium">Business:</span> {r.reporterBusiness || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Fraud Details */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                      <FileText className="w-5 h-5" />
                      Incident Details
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Type:</span> {r.fraudType || 'N/A'}</p>
                      <p><span className="font-medium">City:</span> {r.fraudCity || 'N/A'}</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/fraudlist/${r._id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Report
                    </Link>
                    <Link
                      to={`/update-report/${r._id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Update Report
                    </Link>
                    <button
                      onClick={() => openDeleteModal(r._id, r.personName)}
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="px-6 pb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Description:</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {r.moreDetails || 'No detailed description provided.'}
                  </div>
                </div>

                {/* Images */}
                {(r.shopPic || r.manPic || r.otherPic) && (
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <ImageIcon className="w-5 h-5" />
                      Evidence Photos
                    </div>
                    <div className="flex gap-3 overflow-x-auto">
                      {['shopPic', 'manPic', 'otherPic'].map((key) => (
                        r[key] ? (
                          <div key={key} className="flex-shrink-0">
                            <a href={r[key]} target="_blank" rel="noopener noreferrer">
                              <img
                                src={r[key]}
                                alt={key}
                                className="h-24 w-24 object-cover rounded-lg border-2 border-blue-300 hover:border-blue-500 transition cursor-pointer shadow-sm"
                              />
                            </a>
                            <p className="text-xs text-center text-gray-500 mt-1">{key.replace('Pic', '')}</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                        className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition ${currentPage === page
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
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, reportId: null, reportName: '' })}
        title="Confirm Deletion"
        icon={Trash2}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to permanently delete the report for <span className="font-semibold">{deleteModal.reportName}</span>?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteModal({ isOpen: false, reportId: null, reportName: '' })}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, reportId: null, newStatus: '', reportName: '' })}
        title="Confirm Status Change"
        icon={AlertTriangle}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to change the status of the report for <span className="font-semibold">{statusModal.reportName}</span> to <span className="font-semibold">"{STATUS_BADGE[statusModal.newStatus]}"</span>?
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStatusModal({ isOpen: false, reportId: null, newStatus: '', reportName: '' })}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmStatusUpdate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}