import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'toasticom';
import { User, Briefcase, Phone, Upload, AlertTriangle, MapPin, FileText, Image as ImageIcon, CheckCircle, X, Loader2 } from 'lucide-react';

// Modal Component
function Modal({ isOpen, onClose, title, children, icon: Icon }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="w-6 h-6 text-blue-600" />}
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

// Configuration Data
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

// Custom Input Field Component
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

// Main Component
export default function ReportForm() {
    const [form, setForm] = useState({
        reporterName: '',
        reporterBusiness: '',
        reporterMobile: '',
        reporterVisitingCard: null,
        fraudType: '',
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
        shopPic: null,
        manPic: null,
        otherPic: null,
    });

    const [previews, setPreviews] = useState({
        reporterVisitingCard: null,
        shopPic: null,
        manPic: null,
        otherPic: null,
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    // Clear city when province changes
    useEffect(() => {
        setForm(prevForm => ({
            ...prevForm,
            fraudCity: '',
            customCity: ''
        }));
    }, [form.fraudProvince]);

    function handleChange(e) {
        const { name, value, files } = e.target;

        if (files) {
            const file = files[0];
            setForm(prevForm => ({ ...prevForm, [name]: file }));

            if (file) {
                setPreviews(prevPreviews => ({ ...prevPreviews, [name]: URL.createObjectURL(file) }));
            } else {
                setPreviews(prevPreviews => ({ ...prevPreviews, [name]: null }));
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

            setForm(prevForm => ({ ...prevForm, [name]: finalValue }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!acknowledged) {
            toast('error', 'Please acknowledge the declaration.');
            return;
        }

        setLoading(true);

        const isOtherSelected = form.fraudCity === OTHER_CITY_OPTION;
        const finalCity = isOtherSelected ? form.customCity : form.fraudCity;

        // Validation
        if (form.fraudProvince === Object.keys(PROVINCES)[0]) {
            toast('error', 'Please select a Province.');
            setLoading(false);
            return;
        }

        if (form.fraudCity === '' || (isOtherSelected && form.customCity.trim() === '')) {
            toast('error', 'Please select a valid City or enter a custom location.');
            setLoading(false);
            return;
        }

        if (form.buyerType === BUYER_TYPES[0]) {
            toast('error', 'Please select a Buyer Type.');
            setLoading(false);
            return;
        }

        if (form.reporterMobile.length !== 11) {
            toast('error', 'Your Mobile Number must be exactly 11 digits.');
            setLoading(false);
            return;
        }

        if (form.fraudMobile1.length !== 11) {
            toast('error', 'Primary Fraud Mobile Number must be exactly 11 digits.');
            setLoading(false);
            return;
        }

        if (form.fraudMobile2 && form.fraudMobile2.length !== 11) {
            toast('error', 'Secondary Fraud Mobile Number must be exactly 11 digits.');
            setLoading(false);
            return;
        }

        if (form.fraudMobile3 && form.fraudMobile3.length !== 11) {
            toast('error', 'Third Fraud Mobile Number must be exactly 11 digits.');
            setLoading(false);
            return;
        }

        if (form.cnicNumber.length !== 13) {
            toast('error', 'CNIC Number must be exactly 13 digits (without dashes).');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("reporterName", form.reporterName);
            formData.append("reporterBusiness", form.reporterBusiness);
            formData.append("reporterMobile", form.reporterMobile);
            formData.append("fraudType", form.fraudType);
            formData.append("buyerType", form.buyerType);
            formData.append("personName", form.personName);
            formData.append("fraudMobile1", form.fraudMobile1);
            if (form.fraudMobile2) formData.append("fraudMobile2", form.fraudMobile2);
            if (form.fraudMobile3) formData.append("fraudMobile3", form.fraudMobile3);
            formData.append("fraudBusinessName", form.fraudBusinessName);
            formData.append("fraudProvince", form.fraudProvince);
            formData.append("fraudCity", finalCity);
            formData.append("cnicNumber", form.cnicNumber);
            formData.append("moreDetails", form.moreDetails);

            if (form.reporterVisitingCard) formData.append("reporterVisitingCard", form.reporterVisitingCard);
            if (form.shopPic) formData.append("shopPic", form.shopPic);
            if (form.manPic) formData.append("manPic", form.manPic);
            if (form.otherPic) formData.append("otherPic", form.otherPic);

            await axios.post("http://localhost:5000/api/reports", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast('success', 'Report submitted successfully!');
            setShowSuccessModal(true);

            // Cleanup
            Object.values(previews).forEach(url => url && URL.revokeObjectURL(url));
            setPreviews({
                reporterVisitingCard: null,
                shopPic: null,
                manPic: null,
                otherPic: null
            });

            setForm({
                reporterName: '',
                reporterBusiness: '',
                reporterMobile: '',
                reporterVisitingCard: null,
                fraudType: '',
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
                shopPic: null,
                manPic: null,
                otherPic: null,
            });
            setAcknowledged(false);

        } catch (err) {
            console.error("❌ Error submitting report:", err);
            toast('error', 'Error submitting report. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    }

    const currentProvinceCities = PROVINCES[form.fraudProvince] || [];

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Fraud Report Form</h1>
                    </div>
                    <p className="text-gray-600">
                        دھوکہ دہی کی رپورٹ <span className="text-red-500">*</span>
                    </p>
                </div>

                {/* Reporter Details Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                        <User className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">1. Reporter Details - رپورٹ کرنے والے کی تفصیلات</h2>
                    </div>

                    <InputField
                        label={getLabelWithUrdu("Full Name", "پورا نام")}
                        name="reporterName"
                        value={form.reporterName}
                        onChange={handleChange}
                        required={true}
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
                        required={true}
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
                                    Image Preview (تصویر کا پیش نظارہ)
                                </p>
                                <img
                                    src={previews.reporterVisitingCard}
                                    alt="Visiting Card Preview"
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
                        <h2 className="text-xl font-bold text-gray-900">2. Details of the Fraud - دھوکہ دہی کی تفصیلات</h2>
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
                            {BUYER_TYPES.map(type => (<option key={type} value={type} disabled={type === BUYER_TYPES[0]}>{type}</option>))}
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

                    {/* Custom City Input */}
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
                                placeholder="e.g., Kacha Khuh, or a specific village name"
                                required
                                className="block w-full px-3 py-2 border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition bg-white"
                            />
                            <p className="mt-2 text-xs text-gray-600">Please enter the specific town or village name here. (براہ کرم یہاں مخصوص قصبے یا گاؤں کا نام درج کریں)</p>
                        </div>
                    )}

                    <InputField
                        label={getLabelWithUrdu("Fraud Person's Name", "دھوکہ دینے والے شخص کا نام")}
                        name="personName"
                        value={form.personName}
                        onChange={handleChange}
                        required={true}
                        icon={User}
                    />

                    <InputField
                        label={getLabelWithUrdu("Fraud Mobile Number 1", "دھوکہ باز کا موبائل نمبر 1")}
                        name="fraudMobile1"
                        type="tel"
                        value={form.fraudMobile1}
                        onChange={handleChange}
                        required={true}
                        maxLength={11}
                        icon={Phone}
                    />

                    <InputField
                        label={getLabelWithUrdu("Fraud Mobile Number 2", "دھوکہ باز کا موبائل نمبر 2")}
                        name="fraudMobile2"
                        type="tel"
                        value={form.fraudMobile2}
                        onChange={handleChange}
                        required={false}
                        maxLength={11}
                        icon={Phone}
                    />

                    <InputField
                        label={getLabelWithUrdu("Fraud Mobile Number 3", "دھوکہ باز کا موبائل نمبر 3")}
                        name="fraudMobile3"
                        type="tel"
                        value={form.fraudMobile3}
                        onChange={handleChange}
                        required={false}
                        maxLength={11}
                        icon={Phone}
                    />

                    <InputField
                        label={getLabelWithUrdu("CNIC Number (13 Digits)", "قومی شناختی کارڈ نمبر")}
                        name="cnicNumber"
                        type="text"
                        value={form.cnicNumber}
                        onChange={handleChange}
                        required={true}
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
                        placeholder="Explain what happened, including dates and amounts."
                        required={true}
                    />
                </div>

                {/* Evidence Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">3. Evidence (Images) - ثبوت (تصاویر)</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Please upload any pictures you have (Max 1 file per type). (براہ کرم کوئی بھی تصویر اپ لوڈ کریں)
                    </p>

                    {['shopPic', 'manPic', 'otherPic'].map((name) => (
                        <div key={name} className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                <div className="flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-600" />
                                    {name === 'shopPic' ? getLabelWithUrdu('Photo of Shop/Location', 'دکان/جگہ کی تصویر') :
                                        name === 'manPic' ? getLabelWithUrdu("Photo of Person (If Available)", "شخص کی تصویر (اگر دستیاب ہو)") :
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
                                        Image Preview (تصویر کا پیش نظارہ)
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

                    {/* WhatsApp Note */}
                    <div className="p-3 mt-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md shadow-sm">
                        <p className="text-sm text-gray-800 font-medium">
                            **نوٹ:** اگر آپ یہاں تصاویر اپ لوڈ نہیں کر سکتے، تو براہ کرم اپنی رپورٹ جمع کرانے کے بعد ثبوت{" "}
                            <a
                                href="https://wa.me/923006623362"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-extrabold text-green-700 hover:text-green-800 transition-colors whitespace-nowrap"
                            >
                                **فوری طور پر واٹس ایپ نمبر 0300-6623362 پر بھیجیں**
                            </a>
                        </p>
                    </div>
                </div>

                {/* Declaration Section */}
                <div className="mt-6 p-4 border-l-4 border-red-600 bg-red-50 rounded-md shadow-sm">
                    <h2 className="text-red-700 font-bold text-lg mb-2">اہم نوٹ:</h2>
                    <p className="text-gray-800 font-medium leading-relaxed">
                        معلومات دینے والا اللہ کو حاضر و ناظر جان کر یہ حلف اٹھا رہا ہے کہ اوپر دی گئی تمام معلومات مکمل سچ ہیں
                        اور ان میں کوئی غلط بیانی یا بڑھا چڑھا کر معلومات نہیں دی گئی ہیں۔ اور معلومات دینے والا ان معلومات کے غلط
                        ثابت ہونے پر اللہ کے عذاب کا مستحق اور خود قانونی، اخلاقی اور شرعی طور پر اس کا زمہ دار ہوگا۔
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="acknowledge"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label
                            htmlFor="acknowledge"
                            className="text-gray-700 font-medium cursor-pointer"
                        >
                            میں تصدیق کرتا/کرتی ہوں کہ میں نے اوپر دیا گیا اہم نوٹ پڑھ لیا ہے۔
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !acknowledged}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-lg shadow-lg transition duration-200 ${loading || !acknowledged ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting... (رپورٹ جمع ہو رہی ہے)
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Submit Fraud Report (دھوکہ دہی کی رپورٹ جمع کرائیں)
                        </>
                    )}
                </button>
            </form>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/923006623362"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all z-50"
                title="Contact via WhatsApp"
            >
                <Phone className="w-8 h-8" />
            </a>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Report Submitted Successfully!"
                icon={CheckCircle}
            >
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-gray-700 text-lg font-medium">
                        Your fraud report has been submitted successfully.
                    </p>
                    <p className="text-gray-600">
                        آپ کی رپورٹ کامیابی سے درج کر لی گئی ہے۔ نگرانی کے لیے شکریہ۔
                    </p>
                    <button
                        onClick={() => setShowSuccessModal(false)}
                        className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Submit Another Report (ایک اور رپورٹ درج کریں)
                    </button>
                </div>
            </Modal>
        </>
    );
}