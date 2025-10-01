import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'fraud_reports_v1';

// Helper to load reports from localStorage
function loadReports() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// Map status to Tailwind classes for clear visual feedback
const STATUS_STYLES = {
  'new': 'bg-red-100 text-red-800 border-red-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'closed': 'bg-green-100 text-green-800 border-green-300',
};

// Map status to user-friendly badge text
const STATUS_BADGE = {
    'new': 'New',
    'in-progress': 'In Progress',
    'closed': 'Closed',
}

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Check if admin is logged in (basic security for demonstration)
useEffect(() => {
  async function fetchReports() {
    try {
      const res = await axios.get("http://localhost:5000/api/reports");
      setReports(res.data);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
    }
  }
   
  if (localStorage.getItem("isAdmin") !== "true") {
    navigate("/admin-login");
  } else {
    fetchReports();
  }
}, [navigate]);

  function updateStatus(id, status) {
    // Confirmation for changing status
    if (!window.confirm(`Are you sure you want to change the status to "${status}"?`)) {
        return;
    }
    const cur = loadReports().map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
    setReports(cur);
  }

  function deleteReport(id) {
    if (!window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
        return;
    }
    const cur = loadReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
    setReports(cur);
  }

  function handleLogout() {
    localStorage.removeItem('isAdmin');
    navigate('/');
  }

  // Filter the reports based on the selected filter
  const visibleReports = reports.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">

        {/* Header and Controls */}
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Admin Panel <span className="text-indigo-600">({visibleReports.length})</span>
          </h1>
          <div className='flex items-center space-x-3'>
            <Link 
                to="/" 
                className="py-2 px-4 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition duration-150"
            >
                Go to Form
            </Link>
            <button
                onClick={handleLogout}
                className="py-2 px-4 text-sm border border-red-500 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition duration-150"
            >
                Logout
            </button>
          </div>
        </header>

        {/* Filter and Count */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <label htmlFor="filter" className="text-base font-medium text-gray-700">Filter Reports:</label>
            <select 
                id="filter"
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="all">All ({reports.length})</option>
              <option value="new">New ({reports.filter(r => r.status === 'new').length})</option>
              <option value="in-progress">In Progress ({reports.filter(r => r.status === 'in-progress').length})</option>
              <option value="closed">Closed ({reports.filter(r => r.status === 'closed').length})</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {visibleReports.length === 0 && (
            <div className="text-center p-10 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xl text-gray-500">🎉 All clear! No {filter === 'all' ? '' : filter} reports found.</p>
            </div>
          )}

          {visibleReports.map(r => (
            <div 
                key={r.id} 
                className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition duration-300"
            >
                {/* Report Header/Summary */}
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                    <div>
                        <div className="text-xl font-bold text-gray-900">
                            {r.personName} ({r.fraudCity})
                        </div>
                        <div className="text-sm text-gray-500">
                            Business: {r.fraudBusinessName || 'N/A'}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_BADGE[r.status]}
                        </span>
                        
                        {/* Status Change Dropdown */}
                        <select 
                            value={r.status} 
                            onChange={e => updateStatus(r.id, e.target.value)} 
                            className="p-1 border border-gray-300 rounded-md bg-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="new">Mark as New</option>
                            <option value="in-progress">Mark In Progress</option>
                            <option value="closed">Mark Closed</option>
                        </select>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Reporter Info */}
                    <div className="p-3 bg-indigo-50 rounded-md">
                        <div className="font-semibold text-indigo-700">Reporter Info</div>
                        <p>Name: {r.reporterName || 'N/A'}</p>
                        <p>Mobile: {r.reporterMobile || 'N/A'}</p>
                        <p>Business: {r.reporterBusiness || 'N/A'}</p>
                    </div>

                    {/* Fraud Details */}
                    <div className="p-3 bg-gray-50 rounded-md">
                        <div className="font-semibold text-gray-700">Incident Details</div>
                        <p>Type: {r.fraudType || 'N/A'}</p>
                        <p>City: {r.fraudCity || 'N/A'}</p>
                        <p>Reported: {new Date(r.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-red-50 rounded-md flex items-center justify-center">
                        <button 
                            onClick={() => deleteReport(r.id)} 
                            className="w-full py-2 px-4 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150"
                        >
                            🗑️ Permanently Delete
                        </button>
                    </div>
                </div>

                {/* Detailed Description */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Description:</div>
                    <div className="text-base text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded-md border">
                        {r.moreDetails || 'No detailed description provided.'}
                    </div>
                </div>

                {/* Images Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Evidence:</div>
                    <div className="flex space-x-4 overflow-x-auto">
                        {['shopPic', 'manPic', 'otherPic'].map((key, index) => (
                            r[key] ? (
                                <div key={index} className='flex-shrink-0'>
                                    <a href={r[key]} target="_blank" rel="noopener noreferrer">
                                        <img 
                                            src={r[key]} 
                                            alt={key} 
                                            className="h-24 w-24 object-cover rounded-md border-2 border-indigo-300 shadow-md hover:border-indigo-500 transition duration-150 cursor-pointer" 
                                        />
                                    </a>
                                    <p className='text-xs text-center text-gray-500 mt-1'>{key.replace('Pic', '')}</p>
                                </div>
                            ) : null
                        ))}
                        {(!r.shopPic && !r.manPic && !r.otherPic) && (
                            <p className='text-sm text-gray-500'>No images uploaded for this report.</p>
                        )}
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}