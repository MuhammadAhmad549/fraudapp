import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'toasticom';
import {
    Edit, User, Briefcase, Phone, Upload, AlertTriangle, MapPin,
    FileText, Image as ImageIcon, CheckCircle, Loader2, ArrowLeft
} from 'lucide-react';
import axios from 'axios';

const OTHER_CITY_OPTION = "Other / Village Name (Please Specify Below)";

const PROVINCES = {
    "Select Province": [],
    "Azad Kashmir": [
        "Athmuqam", "Bagh", "Kotli", "Muzaffarabad", "New Mirpur",
        "Rawala Kot", OTHER_CITY_OPTION
    ],
    Balochistan: [
        "Awaran", "Barkhan", "Chaman", "Dalbandin", "Dera Allahyar",
        "Dera Bugti", "Dera Murad Jamali", "Gandava", "Gwadar", "Kalat",
        "Kharan", "Khuzdar", "Kohlu", "Loralai", "Mastung", "Musa Khel Bazar",
        "Panjgur", "Pishin", "Quetta", "Qila Saifullah", "Sibi", "Turbat",
        "Uthal", "Zhob", "Ziarat", OTHER_CITY_OPTION
    ],
    "Gilgit-Baltistan": [
        "Aliabad", "Chilas", "Dainyor", "Eidgah", "Gakuch", "Gilgit",
        OTHER_CITY_OPTION
    ],
    "Khyber Pakhtunkhwa": [
        "Abbottabad", "Alpurai", "Bannu", "Batgram", "Charsadda", "Chitral",
        "Dera Ismail Khan", "Hangu", "Haripur", "Karak", "Kohat", "Kulachi",
        "Malakand", "Mansehra", "Mardan", "Mingaora", "Nowshera", "Parachinar",
        "Peshawar", "Risalpur Cantonment", "Saidu Sharif", "Swabi", "Tank",
        "Timargara", OTHER_CITY_OPTION
    ],
    Punjab: [
        "Bahawalpur", "Burewala", "Chiniot", "Dera Ghazi Khan", "Faisalabad",
        "Gujranwala", "Gujrat", "Hafizabad", "Jhang", "Kasur", "Khanewal",
        "Lahore", "Mandi Bahauddin", "Multan", "Okara", "Rahim Yar Khan",
        "Rawalpindi", "Sahiwal", "Sargodha", "Sheikhupura", "Sialkot",
        "Toba Tek Singh", OTHER_CITY_OPTION
    ],
    Sindh: [
        "Hyderabad", "Jacobabad", "Karachi", "Larkana", "Mirpur Khas",
        "Nawabshah", "Sukkur", OTHER_CITY_OPTION
    ],
    Other: [OTHER_CITY_OPTION]
};

const BUYER_TYPES = [
    'Select Buyer Type',
    'Transporter (ٹرانسپورٹر)',
    'Salesman (سیلز مین)',
    'Shopkeeper (دکاندار)',
    'General Customer (عام گاہک)',
    'Other (دیگر)',
];

const getLabelWithUrdu = (enLabel, urduLabel) => (
    <>
        {enLabel} <span className="font-normal text-sm text-gray-500">(<span className="font-medium">{urduLabel}</span>)</span>
    </>
);

const InputField = ({ label, name, type = 'text', value, onChange, required = false, placeholder, helpText = null, maxLength = null, icon: Icon }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />}
            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`mt-1 block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                />
            )}
        </div>
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

export default function UpdateReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        reporterName: '',
        reporterBusiness: '',
        reporterMobile: '',
        buyerType: BUYER_TYPES[0],
        personName: '',
        fraudMobile1: '',
        fraudMobile2: '',
        fraudMobile3: '',
        fraudBusinessName: '',
        fraudProvince: Object.keys(PROVINCES)[0],
        fraudCity: '',
        cnicNumber: '',
        customCity: '',
        moreDetails: '',
        status: 'new',
        shopPic: null,
        manPic: null,
        otherPic: null,
        reporterVisitingCard: null,
    });

    const [previews, setPreviews] = useState({
        reporterVisitingCard: null,
        shopPic: null,
        manPic: null,
        otherPic: null,
    });

    const [isUpdating, setIsUpdating] = useState(false);

    // Clear city when province changes
    useEffect(() => {
        if (report) return; // Don't clear on initial load
        setForm(prevForm => ({
            ...prevForm,
            fraudCity: '',
            customCity: ''
        }));
    }, [form.fraudProvince, report]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin');
            return;
        }

        async function fetchReport() {
            try {
                const res = await axios.get(`http://localhost:5000/api/reports/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data;
                setReport(data);

                setForm({
                    reporterName: data.reporterName || '',
                    reporterBusiness: data.reporterBusiness || '',
                    reporterMobile: data.reporterMobile || '',
                    buyerType: data.buyerType || BUYER_TYPES[0],
                    personName: data.personName || '',
                    fraudMobile1: data.fraudMobile1 || '',
                    fraudMobile2: data.fraudMobile2 || '',
                    fraudMobile3: data.fraudMobile3 || '',
                    fraudBusinessName: data.fraudBusinessName || '',
                    fraudProvince: data.fraudProvince || Object.keys(PROVINCES)[0],
                    fraudCity: data.fraudCity || '',
                    cnicNumber: data.cnicNumber || '',
                    customCity: data.customCity || '',
                    moreDetails: data.moreDetails || '',
                    status: data.status || 'new',
                    shopPic: null,
                    manPic: null,
                    otherPic: null,
                    reporterVisitingCard: null,
                });

                setPreviews({
                    reporterVisitingCard: data.reporterVisitingCard || null,
                    shopPic: data.shopPic || null,
                    manPic: data.manPic || null,
                    otherPic: data.otherPic || null,
                });
            } catch (err) {
                console.error('Error fetching report:', err);
                toast('error', 'Failed to load report. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            const file = files[0];
            setForm(prev => ({ ...prev, [name]: file }));

            if (file) {
                const previewUrl = URL.createObjectURL(file);
                setPreviews(prev => ({ ...prev, [name]: previewUrl }));
            }
        } else {
            let finalValue = value;
            if (
                name === 'cnicNumber' ||
                name === 'reporterMobile' ||
                name === 'fraudMobile1' ||
                name === 'fraudMobile2' ||
                name === 'fraudMobile3'
            ) {
                finalValue = value.replace(/\D/g, '');
            }
            setForm(prev => ({ ...prev, [name]: finalValue }));
        }
    };

    const handleStatusChange = (e) => {
        setForm(prev => ({ ...prev, status: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const isOtherSelected = form.fraudCity === OTHER_CITY_OPTION;
        const finalCity = isOtherSelected ? form.customCity : form.fraudCity;

        // Validation
        if (form.fraudProvince === Object.keys(PROVINCES)[0]) {
            toast('error', 'Please select a Province.');
            setIsUpdating(false);
            return;
        }

        if (form.fraudCity === '' || (isOtherSelected && form.customCity.trim() === '')) {
            toast('error', 'Please select a valid City or enter a custom location.');
            setIsUpdating(false);
            return;
        }

        if (form.reporterMobile.length !== 11) {
            toast('error', 'Reporter Mobile Number must be exactly 11 digits.');
            setIsUpdating(false);
            return;
        }

        if (form.fraudMobile1.length !== 11) {
            toast('error', 'Primary Fraud Mobile Number must be exactly 11 digits.');
            setIsUpdating(false);
            return;
        }

        if (form.fraudMobile2 && form.fraudMobile2.length !== 11) {
            toast('error', 'Secondary Fraud Mobile Number must be exactly 11 digits.');
            setIsUpdating(false);
            return;
        }

        if (form.fraudMobile3 && form.fraudMobile3.length !== 11) {
            toast('error', 'Third Fraud Mobile Number must be exactly 11 digits.');
            setIsUpdating(false);
            return;
        }

        if (form.cnicNumber.length !== 13) {
            toast('error', 'CNIC Number must be exactly 13 digits.');
            setIsUpdating(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('reporterName', form.reporterName);
            formData.append('reporterBusiness', form.reporterBusiness);
            formData.append('reporterMobile', form.reporterMobile);
            formData.append('buyerType', form.buyerType);
            formData.append('personName', form.personName);
            formData.append('fraudMobile1', form.fraudMobile1);
            if (form.fraudMobile2) formData.append('fraudMobile2', form.fraudMobile2);
            if (form.fraudMobile3) formData.append('fraudMobile3', form.fraudMobile3);
            formData.append('fraudBusinessName', form.fraudBusinessName);
            formData.append('fraudProvince', form.fraudProvince);
            formData.append('fraudCity', finalCity);
            formData.append('customCity', form.customCity);
            formData.append('cnicNumber', form.cnicNumber);
            formData.append('moreDetails', form.moreDetails);
            formData.append('status', form.status);

            if (form.shopPic) formData.append('shopPic', form.shopPic);
            if (form.manPic) formData.append('manPic', form.manPic);
            if (form.otherPic) formData.append('otherPic', form.otherPic);
            if (form.reporterVisitingCard) formData.append('reporterVisitingCard', form.reporterVisitingCard);

            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/reports/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            toast('success', 'Report updated successfully!');
            navigate('/admin/panel');
        } catch (err) {
            console.error('Error updating report:', err);
            toast('error', 'Failed to update report. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Report not found.</p>
                </div>
            </div>
        );
    }

    const currentProvinceCities = PROVINCES[form.fraudProvince] || [];

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 p-4">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <button
                    type="button"
                    onClick={() => navigate('/admin/panel')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Admin Panel
                </button>
                <div className="flex items-center gap-3 mb-3">
                    <Edit className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Update Fraud Report</h1>
                </div>
                <p className="text-gray-600">Update the details below and save changes.</p>
            </div>

            {/* Reporter Details Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">1. Reporter Details</h2>
                </div>

                <InputField
                    label={getLabelWithUrdu("Full Name", "پورا نام")}
                    name="reporterName"
                    value={form.reporterName}
                    onChange={handleChange}
                    required
                    icon={User}
                />

                <InputField
                    label={getLabelWithUrdu("Business Name", "کاروبار کا نام")}
                    name="reporterBusiness"
                    value={form.reporterBusiness}
                    onChange={handleChange}
                    icon={Briefcase}
                />

                <InputField
                    label={getLabelWithUrdu("Mobile Number", "موبائل نمبر")}
                    name="reporterMobile"
                    type="tel"
                    value={form.reporterMobile}
                    onChange={handleChange}
                    required
                    maxLength={11}
                    icon={Phone}
                />

                {/* Visiting Card Upload */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-600" />
                            {getLabelWithUrdu('Visiting Card', 'بزنس کارڈ')}
                        </div>
                    </label>
                    <input
                        type="file"
                        name="reporterVisitingCard"
                        accept="image/*"
                        onChange={handleChange}
                        className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {previews.reporterVisitingCard && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                            <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Current / New Preview
                            </p>
                            <img
                                src={previews.reporterVisitingCard}
                                alt="Visiting Card"
                                className="h-32 w-32 object-cover rounded-lg shadow-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Fraud Details Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-900">2. Fraud Details</h2>
                </div>

                {/* Buyer Type */}
                <div className="mb-4">
                    <label htmlFor="buyerType" className="block text-sm font-semibold text-gray-700 mb-2">
                        {getLabelWithUrdu("Buyer Type", "خریدار کی قسم")} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="buyerType"
                        name="buyerType"
                        value={form.buyerType}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                        {BUYER_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                    </select>
                </div>

                {/* Province Dropdown */}
                <div className="mb-4">
                    <label htmlFor="fraudProvince" className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {getLabelWithUrdu("Province/Region", "صوبہ/علاقہ")} <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <select
                        id="fraudProvince"
                        name="fraudProvince"
                        value={form.fraudProvince}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.keys(PROVINCES).map(province => (
                            <option key={province} value={province} disabled={province === Object.keys(PROVINCES)[0]}>{province}</option>
                        ))}
                    </select>
                </div>

                {/* City Dropdown */}
                {form.fraudProvince && form.fraudProvince !== Object.keys(PROVINCES)[0] && (
                    <div className="mb-4">
                        <label htmlFor="fraudCity" className="block text-sm font-semibold text-gray-700 mb-2">
                            {getLabelWithUrdu("City or Major Town", "شہر یا بڑا قصبہ")} <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="fraudCity"
                            name="fraudCity"
                            value={form.fraudCity}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select City</option>
                            {currentProvinceCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Custom City */}
                {form.fraudCity === OTHER_CITY_OPTION && (
                    <div className="mb-4 p-4 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
                        <label htmlFor="customCity" className="block text-sm font-semibold text-gray-700 mb-2">
                            {getLabelWithUrdu("Custom Location Name", "اپنی مرضی کا مقام")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="customCity"
                            type="text"
                            name="customCity"
                            value={form.customCity}
                            onChange={handleChange}
                            placeholder="e.g., Kacha Khuh"
                            required
                            className="block w-full px-3 py-2 border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition bg-white"
                        />
                    </div>
                )}

                <InputField
                    label={getLabelWithUrdu("Fraud Person's Name", "دھوکہ دینے والے شخص کا نام")}
                    name="personName"
                    value={form.personName}
                    onChange={handleChange}
                    required
                    icon={User}
                />

                <InputField
                    label={getLabelWithUrdu("Fraud Mobile Number 1", "دھوکہ باز کا موبائل نمبر 1")}
                    name="fraudMobile1"
                    type="tel"
                    value={form.fraudMobile1}
                    onChange={handleChange}
                    required
                    maxLength={11}
                    icon={Phone}
                />

                <InputField
                    label={getLabelWithUrdu("Fraud Mobile Number 2", "دھوکہ باز کا موبائل نمبر 2")}
                    name="fraudMobile2"
                    type="tel"
                    value={form.fraudMobile2}
                    onChange={handleChange}
                    maxLength={11}
                    icon={Phone}
                />

                <InputField
                    label={getLabelWithUrdu("Fraud Mobile Number 3", "دھوکہ باز کا موبائل نمبر 3")}
                    name="fraudMobile3"
                    type="tel"
                    value={form.fraudMobile3}
                    onChange={handleChange}
                    maxLength={11}
                    icon={Phone}
                />

                <InputField
                    label={getLabelWithUrdu("CNIC Number (13 Digits)", "قومی شناختی کارڈ نمبر")}
                    name="cnicNumber"
                    type="text"
                    value={form.cnicNumber}
                    onChange={handleChange}
                    required
                    maxLength={13}
                    icon={FileText}
                />

                <InputField
                    label={getLabelWithUrdu("Fraud Business", "دھوکہ دہی والے کاروبار کا نام")}
                    name="fraudBusinessName"
                    value={form.fraudBusinessName}
                    onChange={handleChange}
                    icon={Briefcase}
                />

                <InputField
                    label={getLabelWithUrdu("Detailed Description", "تفصیلی وضاحت")}
                    name="moreDetails"
                    type="textarea"
                    value={form.moreDetails}
                    onChange={handleChange}
                    required
                />

                {/* Status Select */}
                <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                        Report Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleStatusChange}
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Evidence Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">3. Evidence (Images)</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Upload new images to replace existing ones.
                </p>

                {['shopPic', 'manPic', 'otherPic'].map((name) => (
                    <div key={name} className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-blue-600" />
                                {name === 'shopPic' ? getLabelWithUrdu('Photo of Shop/Location', 'دکان/جگہ کی تصویر') :
                                    name === 'manPic' ? getLabelWithUrdu("Photo of Person", "شخص کی تصویر") :
                                        getLabelWithUrdu('Other Evidence Photo', 'دیگر ثبوت کی تصویر')}
                            </div>
                        </label>
                        <input
                            type="file"
                            name={name}
                            accept="image/*"
                            onChange={handleChange}
                            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {previews[name] && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                                <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Current / New Preview
                                </p>
                                <img
                                    src={previews[name]}
                                    alt={`${name} Preview`}
                                    className="h-32 w-32 object-cover rounded-lg shadow-sm"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isUpdating}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-lg shadow-lg transition duration-200 ${isUpdating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'}`}
            >
                {isUpdating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating Report...
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Update Report
                    </>
                )}
            </button>
        </form>
    );
}