import React, { useState, useEffect } from 'react';
import { Plus, Search, Key, MapPin, Calendar, Clock, CheckCircle, XCircle, Edit2, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'toasticom';

function ManageOtp() {
    const [otps, setOtps] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [otpValue, setOtpValue] = useState('');
    const [city, setCity] = useState('');
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [stats, setStats] = useState({ active: 0, expired: 0, used: 0 });
    const navigate = useNavigate();
    const limit = 10;

    const fetchOtps = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: currentPage,
                limit: limit,
                ...(search && { search })
            });

            const response = await fetch(`http://localhost:5000/api/otp/get-by-filter?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch OTPs');

            const data = await response.json();
            setOtps(data.otps || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);

            const active = (data.otps || []).filter(o => !o.isExpired && !o.usedTime).length;
            const expired = (data.otps || []).filter(o => o.isExpired).length;
            const used = (data.otps || []).filter(o => o.usedTime).length;
            setStats({ active, expired, used });
        } catch (err) {
            console.error('Error fetching OTPs:', err);
            toast('error', 'Failed to fetch OTPs. Please try again.');
            setOtps([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOtps();
    }, [currentPage, search]);

    const handleCreateOtp = async () => {
        if (!otpValue || !city) {
            toast('error', 'Please provide both OTP value and city.');
            return;
        }
        if (!/^\d{6}$/.test(otpValue)) {
            toast('error', 'OTP value must be a 6-digit number.');
            return;
        }

        try {
            setCreating(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/otp/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ value: otpValue, city })
            });

            if (!response.ok) throw new Error('Failed to create OTP');

            toast('success', 'OTP created successfully!');
            setOtpValue('');
            setCity('');
            setShowCreateForm(false);
            fetchOtps();
        } catch (err) {
            console.error('Error creating OTP:', err);
            toast('error', 'Failed to create OTP. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const getPaginationRange = () => {
        const range = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (otp) => {
        if (otp.isExpired) {
            return (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 inline-flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Expired
                </span>
            );
        }
        if (otp.usedTime) {
            return (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Used
                </span>
            );
        }
        return (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active
            </span>
        );
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 mb-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">OTP Management</h1>
                    <p className="text-gray-600">
                        Create, manage, and monitor one-time passwords for city access
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={Key} label="Total OTPs" value={total} color="bg-blue-500" />
                    <StatCard icon={CheckCircle} label="Active" value={stats.active} color="bg-green-500" />
                    <StatCard icon={Clock} label="Used" value={stats.used} color="bg-purple-500" />
                    <StatCard icon={XCircle} label="Expired" value={stats.expired} color="bg-red-500" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Create New OTP
                    </button>

                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by OTP value or city..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={fetchOtps}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                </div>

                {showCreateForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Create New OTP</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OTP Value (6 digits)
                                </label>
                                <input
                                    type="text"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="123456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Lahore"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    onClick={handleCreateOtp}
                                    disabled={creating}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {creating ? 'Creating...' : 'Create OTP'}
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">OTP Records</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {total > 0 ? `Showing ${(currentPage - 1) * limit + 1} to ${Math.min(currentPage * limit, total)} of ${total} OTPs` : 'No OTPs found'}
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading OTPs...</p>
                        </div>
                    ) : otps.length === 0 ? (
                        <div className="p-12 text-center">
                            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">No OTPs found</p>
                            <p className="text-sm text-gray-500 mt-1">Create your first OTP to get started</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">OTP Value</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Used At</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Read Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {otps.map((otp) => (
                                            <tr key={otp._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Key className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-mono font-semibold text-gray-900">{otp.value}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900">{otp.city}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{formatDate(otp.createdAt)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {otp.updatedAt ? formatDate(otp.updatedAt) : 'Not updated'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-gray-900">{otp.usedTime || 0}</span>
                                                        <span className="text-gray-500"> / {otp.allowedReadTimeMinutes || 30} min</span>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                            <div
                                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${Math.min((otp.readTimeMinutes / (otp.allowedReadTimeMinutes || 30)) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(otp)}
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Previous
                                        </button>
                                        {getPaginationRange().map((page, idx) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="px-4 py-2 text-gray-400">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageOtp;