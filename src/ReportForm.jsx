// import React, { useState } from 'react';

// // --- Configuration Data ---
// const STORAGE_KEY = 'fraud_reports_v1';

// // Expanded list of CITIES/Towns for better relevance (Kept as is)
// const CITIES = [
//     'Select City', 
//     // Punjab
//     'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 
//     'Sargodha', 'Bahawalpur', 'Gujrat', 'Sahiwal', 'Jhang', 'Sheikhupura', 'Jhelum', 
//     'Okara', 'Kasur', 'Rahim Yar Khan', 'Dera Ghazi Khan', 'Mandi Bahauddin', 
//     'Hafizabad', 'Toba Tek Singh', 'Khanewal', 'Chiniot', 'Burewala',
//     // Sindh
//     'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah (Benazirabad)', 
//     'Mirpur Khas', 'Jacobabad',
//     // Khyber Pakhtunkhwa (KPK)
//     'Peshawar', 'Mardan', 'Mingora (Swat)', 'Kohat', 'Abbottabad', 'Swabi', 
//     'Dera Ismail Khan', 'Haripur',
//     // Balochistan
//     'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman',
//     // Capital & Territories
//     'Islamabad', 'Muzaffarabad (AJK)', 'Gilgit (GB)',
    
//     // Final Catch-all Option for custom input
//     'Other / Village Name (Please Specify Below)',
// ];
// const OTHER_CITY_OPTION = CITIES[CITIES.length - 1];

// // NEW CONFIGURATION: Buyer Types
// const BUYER_TYPES = [
//     'Select Buyer Type',
//     'Transporter (ٹرانسپورٹر)',
//     'Salesman (سیلز مین)',
//     'Shopkeeper (دکاندار)',
//     'General Customer (عام گاہک)',
//     'Other (دیگر)',
// ];


// // Utility functions
// function saveReport(report) {
//     const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
//     cur.push(report);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
// }

// // NEW UTILITY FUNCTION: Label with Urdu
// const getLabelWithUrdu = (enLabel, urduLabel) => (
//     <>
//         {enLabel} <span className="font-normal text-sm text-gray-500">(<span className="font-medium">{urduLabel}</span>)</span>
//     </>
// );

// // Custom Input Field Component (Kept for clean code)
// const InputField = ({ label, name, type = 'text', value, onChange, required = false, placeholder, helpText = null }) => (
//     <div className="mb-4">
//         <label htmlFor={name} className="block text-sm font-medium text-gray-700">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         {type === 'textarea' ? (
//             <textarea
//                 id={name}
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 required={required}
//                 placeholder={placeholder}
//                 rows="4"
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//         ) : (
//             <input
//                 id={name}
//                 name={name}
//                 type={type}
//                 value={value}
//                 onChange={onChange}
//                 required={required}
//                 placeholder={placeholder}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//         )}
//         {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
//     </div>
// );


// // Main Component
// export default function ReportForm() {
//     const [form, setForm] = useState({
//         reporterName: '',
//         reporterBusiness: '',
//         reporterMobile: '',
//         fraudType: '',
//         buyerType: BUYER_TYPES[0], // NEW STATE FIELD
//         personName: '',
//         fraudBusinessName: '',
//         fraudCity: CITIES[0], 
//         customCity: '', 
//         moreDetails: '',
//         shopPic: null,
//         manPic: null,
//         otherPic: null,
//     });

//     const [submitted, setSubmitted] = useState(false);

//     function handleChange(e) {
//         const { name, value, files } = e.target;
//         if (files) {
//             // Create a URL for file preview.
//             setForm({ ...form, [name]: URL.createObjectURL(files[0]) }); 
//         } else {
//             setForm({ ...form, [name]: value });
//         }
//     }
    
//     // Handler for the specific custom city input
//     function handleCustomCityChange(e) {
//         setForm({ ...form, customCity: e.target.value });
//     }

//     function handleSubmit(e) {
//         e.preventDefault();

//         // 1. Determine the final city value
//         const isOtherSelected = form.fraudCity === OTHER_CITY_OPTION;
//         const finalCity = isOtherSelected ? form.customCity : form.fraudCity;

//         // 2. Validation
//         if (finalCity === CITIES[0] || finalCity.trim() === '') {
//             alert('Please select a valid City or enter a custom location.');
//             return;
//         }
//         if (form.fraudType.trim() === '') {
//             alert('Please enter the type of fraud.');
//             return;
//         }
//         // NEW VALIDATION: Buyer Type
//         if (form.buyerType === BUYER_TYPES[0]) {
//              alert('Please select a Buyer Type.');
//              return;
//         }

//         // 3. Create the report object
//         const report = {
//             ...form,
//             fraudCity: finalCity, 
//             customCity: undefined, // Remove temporary field from final report
//             id: Date.now(),
//             status: 'new',
//             createdAt: new Date().toISOString(),
//         };
        
//         saveReport(report);
//         setSubmitted(true);

//         // 4. Reset form state 
//         setForm({
//             reporterName: '', reporterBusiness: '', reporterMobile: '',
//             fraudType: '', buyerType: BUYER_TYPES[0], personName: '', 
//             fraudBusinessName: '',
//             fraudCity: CITIES[0], customCity: '', moreDetails: '',
//             shopPic: null, manPic: null, otherPic: null,
//         });
//     }

//     // --- Submission Success View ---
//     if (submitted) {
//         return (
//             <div className="max-w-xl mx-auto mt-10 p-4 sm:p-8 bg-white rounded-lg shadow-2xl border-t-4 border-indigo-500 text-center">
//                 <h1 className="text-3xl font-extrabold text-indigo-700 mb-4">✅ Report Submitted Successfully!</h1>
//                 <p className="text-gray-600 mb-6">
//                     آپ کی رپورٹ کامیابی سے درج کر لی گئی ہے۔ نگرانی کے لیے شکریہ۔
//                 </p>
//                 <button
//                     onClick={() => setSubmitted(false)}
//                     className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out"
//                 >
//                     Submit Another Report (ایک اور رپورٹ درج کریں)
//                 </button>
//             </div>
//         );
//     }

//     // --- Main Form View ---
//     return (
//         <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-0 sm:mt-10 pt-4 pb-12 px-4 sm:p-8 bg-white rounded-xl shadow-2xl border-t-8 border-indigo-600 space-y-6">
//             <header className="text-center mb-6">
//                 <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Fraud Report Form (دھوکہ دہی کی رپورٹ فارم)</h1>
//                 <p className="text-sm text-gray-500 mt-1">
//                     مہربانی کرکے درست تفصیلات فراہم کریں۔ تمام مطلوبہ خانے (<span className="text-red-500">*</span>) سے نشان زد ہیں۔
//                 </p>
//             </header>

//             {/* Reporter Details Section */}
//             <div className="border border-gray-200 p-4 sm:p-5 rounded-lg">
//                 <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
//                     1. Your Details (Reporter) - آپ کی تفصیلات
//                 </h2>
                
//                 <InputField
//                     label={getLabelWithUrdu("Your Full Name", "آپ کا پورا نام")}
//                     name="reporterName"
//                     value={form.reporterName}
//                     onChange={handleChange}
//                     required={true}
//                     placeholder="e.g., Jane Doe"
//                 />

//                 <InputField
//                     label={getLabelWithUrdu("Business Name (Optional)", "کاروبار کا نام (اختیاری)")}
//                     name="reporterBusiness"
//                     value={form.reporterBusiness}
//                     onChange={handleChange}
//                     placeholder="Your company or business name"
//                 />

//                 <InputField
//                     label={getLabelWithUrdu("Mobile Number", "موبائل نمبر")}
//                     name="reporterMobile"
//                     type="tel"
//                     value={form.reporterMobile}
//                     onChange={handleChange}
//                     required={true}
//                     placeholder="e.g., 555-123-4567"
//                     helpText="Used only for follow-up verification. (صرف تصدیق کے لیے استعمال ہوگا)"
//                 />
//             </div>

//             {/* Fraud Details Section */}
//             <div className="border border-gray-200 p-4 sm:p-5 rounded-lg">
//                 <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
//                     2. Details of the Fraud - دھوکہ دہی کی تفصیلات
//                 </h2>
                
//                 {/* NEW FIELD: Buyer Type Dropdown */}
//                 <div className="mb-4">
//                     <label htmlFor="buyerType" className="block text-sm font-medium text-gray-700">
//                         {getLabelWithUrdu("Buyer Type", "خریدار کی قسم")} <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                         id="buyerType"
//                         name="buyerType"
//                         value={form.buyerType}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     >
//                         {BUYER_TYPES.map(type => (
//                             <option key={type} value={type} disabled={type === BUYER_TYPES[0]}>
//                                 {type}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <InputField
//                     label={getLabelWithUrdu("Type of Fraud", "دھوکہ دہی کی قسم")}
//                     name="fraudType"
//                     value={form.fraudType}
//                     onChange={handleChange}
//                     required={true}
//                     placeholder="e.g., Counterfeit Electronics, Rental Scam, Pyramid Scheme"
//                     helpText="Describe the nature of the fraud clearly. (دھوکہ دہی کی نوعیت واضح طور پر بیان کریں)"
//                 />

//                 {/* City Dropdown */}
//                 <div className="mb-4">
//                     <label htmlFor="fraudCity" className="block text-sm font-medium text-gray-700">
//                         {getLabelWithUrdu("City or Major Town of Incident", "واقعہ کا شہر یا بڑا قصبہ")} <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                         id="fraudCity"
//                         name="fraudCity"
//                         value={form.fraudCity}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     >
//                         {CITIES.map(city => (
//                             <option key={city} value={city} disabled={city === CITIES[0]}>
//                                 {city}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* CONDITIONAL TEXT INPUT BOX for 'Other' City */}
//                 {form.fraudCity === OTHER_CITY_OPTION && (
//                     <div className="mb-4 pt-2 border-t border-dashed border-gray-300">
//                         <label htmlFor="customCity" className="block text-sm font-medium text-gray-700">
//                             {getLabelWithUrdu("Custom Location Name", "اپنی مرضی کا مقام")} <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             id="customCity"
//                             type="text"
//                             name="customCity"
//                             value={form.customCity}
//                             onChange={handleCustomCityChange}
//                             placeholder="e.g., Kacha Khuh, or a specific village name"
//                             required
//                             className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-yellow-50"
//                         />
//                         <p className="mt-1 text-xs text-gray-500">
//                             Please enter the specific town or village name here. (براہ کرم یہاں مخصوص قصبے یا گاؤں کا نام درج کریں)
//                         </p>
//                     </div>
//                 )}
                
//                 <InputField
//                     label={getLabelWithUrdu("Fraud Person's Name", "دھوکہ دینے والے شخص کا نام")}
//                     name="personName"
//                     value={form.personName}
//                     onChange={handleChange}
//                     required={true}
//                     placeholder="e.g., John Smith (or 'Unknown')"
//                     helpText="The name of the individual involved. (شامل شخص کا نام)"
//                 />
                
//                 <InputField
//                     label={getLabelWithUrdu("Fraud Business/Organization Name", "دھوکہ دہی والے کاروبار کا نام")}
//                     name="fraudBusinessName"
//                     value={form.fraudBusinessName}
//                     onChange={handleChange}
//                     placeholder="The name of the fraudulent company/shop."
//                 />
                
//                 <InputField
//                     label={getLabelWithUrdu("Detailed Description", "تفصیلی وضاحت")}
//                     name="moreDetails"
//                     type="textarea"
//                     value={form.moreDetails}
//                     onChange={handleChange}
//                     placeholder="Explain what happened, including dates and amounts."
//                     required={true}
//                     helpText="Be as detailed as possible. (جتنی ممکن ہو تفصیلات سے آگاہ کریں)"
//                 />
//             </div>

//             {/* Upload Pics Section (Evidence) */}
//             <div className="border border-gray-200 p-4 sm:p-5 rounded-lg">
//                 <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
//                     3. Evidence (Images) - ثبوت (تصاویر)
//                 </h2>
//                 <p className="text-sm text-gray-600 mb-4">
//                     Please upload any pictures you have (Max 1 file per type). (براہ کرم کوئی بھی تصویر اپ لوڈ کریں)
//                 </p>

//                 {/* Image Upload Fields */}
//                 {['shopPic', 'manPic', 'otherPic'].map((name) => (
//                     <div key={name} className="flex flex-col mb-4 p-3 border border-dashed rounded-md bg-gray-50">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             {name === 'shopPic' ? getLabelWithUrdu('Photo of Shop/Location', 'دکان/جگہ کی تصویر') : 
//                              name === 'manPic' ? getLabelWithUrdu("Photo of Person (If Available)", "شخص کی تصویر (اگر دستیاب ہو)") : 
//                              getLabelWithUrdu('Other Evidence Photo', 'دیگر ثبوت کی تصویر')}
//                         </label>
//                         <input 
//                             type="file" 
//                             name={name} 
//                             accept="image/*" 
//                             onChange={handleChange} 
//                             className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
//                         />
                        
//                         {/* Image Preview Box */}
//                         {form[name] && (
//                             <div className="mt-3 p-2 bg-white rounded-md border border-green-300">
//                                 <p className="text-xs font-semibold text-green-700">Image Preview: (تصویر کا پیش نظارہ)</p>
//                                 <img 
//                                     src={form[name]} 
//                                     alt={`${name} Preview`} 
//                                     className="h-24 w-24 object-cover rounded-md mt-1 shadow-sm"
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>


//             {/* Submit Button */}
//             <button 
//                 type="submit" 
//                 className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
//             >
//                 Submit Fraud Report (دھوکہ دہی کی رپورٹ جمع کرائیں)
//             </button>
//         </form>
//     );
// }



import React, { useState } from 'react';
import axios from 'axios'; // Make sure you have axios installed: npm install axios

// --- Configuration Data (Keeping the config for a complete component) ---

const CITIES = [
    'Select City', 
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 
    'Sargodha', 'Bahawalpur', 'Gujrat', 'Sahiwal', 'Jhang', 'Sheikhupura', 'Jhelum', 
    'Okara', 'Kasur', 'Rahim Yar Khan', 'Dera Ghazi Khan', 'Mandi Bahauddin', 
    'Hafizabad', 'Toba Tek Singh', 'Khanewal', 'Chiniot', 'Burewala',
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah (Benazirabad)', 
    'Mirpur Khas', 'Jacobabad',
    'Peshawar', 'Mardan', 'Mingora (Swat)', 'Kohat', 'Abbottabad', 'Swabi', 
    'Dera Ismail Khan', 'Haripur',
    'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman',
    'Islamabad', 'Muzaffarabad (AJK)', 'Gilgit (GB)',
    'Other / Village Name (Please Specify Below)',
];
const OTHER_CITY_OPTION = CITIES[CITIES.length - 1];

const BUYER_TYPES = [
    'Select Buyer Type',
    'Transporter (ٹرانسپورٹر)',
    'Salesman (سیلز مین)',
    'Shopkeeper (دکاندار)',
    'General Customer (عام گاہک)',
    'Other (دیگر)',
];

// NEW UTILITY FUNCTION: Label with Urdu
const getLabelWithUrdu = (enLabel, urduLabel) => (
    <>
        {enLabel} <span className="font-normal text-sm text-gray-500">(<span className="font-medium">{urduLabel}</span>)</span>
    </>
);

// Custom Input Field Component (UPDATED to accept maxLength)
const InputField = ({ label, name, type = 'text', value, onChange, required = false, placeholder, helpText = null, maxLength = null }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                maxLength={maxLength} // <-- Added maxLength
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        )}
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

// --- Main Component ---
export default function ReportForm() {
    // State to hold actual form data (including File objects for submission)
    const [form, setForm] = useState({
        reporterName: '',
        reporterBusiness: '',
        reporterMobile: '',
        reporterVisitingCard:'',
        fraudType: '',
        buyerType: BUYER_TYPES[0],
        personName: '',
        fraudMobile: '', // <-- NEW: Fraud Mobile Number
        fraudBusinessName: '',
        fraudCity: CITIES[0], 
        cninNumber:'',
        customCity: '', 
        moreDetails: '',
        shopPic: null, // Holds File object
        manPic: null, // Holds File object
        otherPic: null, // Holds File object
    });

    // State to hold image preview URLs (separate from File objects)
    const [previews, setPreviews] = useState({
        shopPic: null,
        manPic: null,
        otherPic: null,
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value, files } = e.target;
        
        if (files) {
            const file = files[0];
            // 1. Store the actual File object in the form state for submission
            setForm(prevForm => ({ ...prevForm, [name]: file }));
            
            // 2. Store the preview URL in the previews state for display
            if (file) {
                setPreviews(prevPreviews => ({ ...prevPreviews, [name]: URL.createObjectURL(file) }));
            } else {
                setPreviews(prevPreviews => ({ ...prevPreviews, [name]: null }));
            }
        } else {
            // New logic to ensure CNIC and Mobile only contain digits and handle max length
            let finalValue = value;
            if (name === 'cninNumber' || name === 'reporterMobile' || name === 'fraudMobile') { // <-- UPDATED: Added fraudMobile
                 // Strip non-digit characters for number fields
                finalValue = value.replace(/\D/g, ''); 
            }

            setForm({ ...form, [name]: finalValue });
        }
    }
    
    function handleCustomCityChange(e) {
        setForm({ ...form, customCity: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const isOtherSelected = form.fraudCity === OTHER_CITY_OPTION;
        const finalCity = isOtherSelected ? form.customCity : form.fraudCity;

        // 2. Validation
        if (finalCity === CITIES[0] || finalCity.trim() === '') {
            alert('Please select a valid City or enter a custom location.');
            setLoading(false);
            return;
        }
        if (form.fraudType.trim() === '') {
            alert('Please enter the type of fraud.');
            setLoading(false);
            return;
        }
        if (form.buyerType === BUYER_TYPES[0]) {
            alert('Please select a Buyer Type.');
            setLoading(false);
            return;
        }
        // Mobile number length validation
        if (form.reporterMobile.length !== 11) {
            alert('Your Mobile Number must be exactly 11 digits (without country code).');
            setLoading(false);
            return;
        }
        if (form.fraudMobile.length !== 11) { // <-- NEW: Fraud Mobile validation
            alert('Fraud Mobile Number must be exactly 11 digits.');
            setLoading(false);
            return;
        }
        // CNIC length validation
        if (form.cninNumber.length !== 13) {
            alert('CNIC Number must be exactly 13 digits (without dashes).');
            setLoading(false);
            return;
        }


        try {
            // Prepare FormData (This part is correct from your snippet)
            const formData = new FormData();
            formData.append("reporterName", form.reporterName);
            formData.append("reporterBusiness", form.reporterBusiness);
            formData.append("reporterMobile", form.reporterMobile);
            formData.append("fraudType", form.fraudType);
            formData.append("buyerType", form.buyerType);
            formData.append("personName", form.personName);
            formData.append("fraudMobile", form.fraudMobile); // <-- ADDED: Fraud Mobile
            formData.append("fraudBusinessName", form.fraudBusinessName);
            formData.append("fraudCity", finalCity);
            formData.append("cninNumber", form.cninNumber); 
            formData.append("moreDetails", form.moreDetails);

            // Append File objects stored in the form state
            if (form.shopPic) formData.append("shopPic", form.shopPic);
            if (form.manPic) formData.append("manPic", form.manPic);
            if (form.otherPic) formData.append("otherPic", form.otherPic);

            // Send to backend API
            await axios.post("http://localhost:5000/api/reports", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSubmitted(true);
            
            // Cleanup: Revoke preview URLs and reset all states
            Object.values(previews).forEach(url => url && URL.revokeObjectURL(url));
            setPreviews({ shopPic: null, manPic: null, otherPic: null });
            setForm({
                reporterName: '', reporterBusiness: '', reporterMobile: '',
                fraudType: '', buyerType: BUYER_TYPES[0], personName: '', 
                fraudMobile: '', // Reset fraud mobile
                fraudBusinessName: '',
                fraudCity: CITIES[0], cninNumber: '', customCity: '', moreDetails: '', 
                shopPic: null, manPic: null, otherPic: null,
            });

        } catch (err) {
            console.error("❌ Error submitting report:", err);
            alert("Error submitting report. Please check your network and try again.");
        } finally {
            setLoading(false);
        }
    }

    // --- Submission Success View ---
    if (submitted) {
        return (
            <div className="max-w-xl mx-auto mt-10 p-4 sm:p-8 bg-white rounded-lg shadow-2xl border-t-4 border-indigo-500 text-center">
                <h1 className="text-3xl font-extrabold text-indigo-700 mb-4">✅ Report Submitted Successfully!</h1>
                <p className="text-gray-600 mb-6">
                    آپ کی رپورٹ کامیابی سے درج کر لی گئی ہے۔ نگرانی کے لیے شکریہ۔
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out"
                >
                    Submit Another Report (ایک اور رپورٹ درج کریں)
                </button>
            </div>
        );
    }

    // --- Main Form View ---
    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-0 sm:mt-10 pt-4 pb-12 px-4 sm:p-8 bg-white rounded-xl shadow-2xl border-t-8 border-indigo-600 space-y-6">
            <header className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Fraud Report Form (دھوکہ دہی کی رپورٹ فارم)</h1>
                <p className="text-sm text-gray-500 mt-1">
                    مہربانی کرکے درست تفصیلات فراہم کریں۔ تمام مطلوبہ خانے (<span className="text-red-500">*</span>) سے نشان زد ہیں۔
                </p>
            </header>

            {/* Reporter Details Section */}
            <div className="border border-gray-200 p-4 sm:p-5 rounded-lg">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                    1. Your Details (Reporter) - آپ کی تفصیلات
                </h2>
                <InputField label={getLabelWithUrdu("Your Full Name", "آپ کا پورا نام")} name="reporterName" value={form.reporterName} onChange={handleChange} required={true} placeholder="e.g., Jane Doe" />
                <InputField label={getLabelWithUrdu("Business Name (Optional)", "کاروبار کا نام (اختیاری)")} name="reporterBusiness" value={form.reporterBusiness} onChange={handleChange} placeholder="Your company or business name" />
                <InputField 
                    label={getLabelWithUrdu("Mobile Number (11 Digits)", "موبائل نمبر (11 ہندسوں کا)")} 
                    name="reporterMobile" 
                    type="tel" 
                    value={form.reporterMobile} 
                    onChange={handleChange} 
                    required={true} 
                    placeholder="e.g., 03XX-XXXXXXX (11 Digits)" 
                    helpText="Used only for follow-up verification. (صرف تصدیق کے لیے استعمال ہوگا)" 
                    maxLength={11} 
                />
            </div>

            {/* Fraud Details Section (Fraud Mobile Added) */}
            <div className="border border-gray-200 p-4 sm:p-5 rounded-lg">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                    2. Details of the Fraud - دھوکہ دہی کی تفصیلات
                </h2>
                
                {/* Buyer Type Dropdown */}
                <div className="mb-4">
                    <label htmlFor="buyerType" className="block text-sm font-medium text-gray-700">
                        {getLabelWithUrdu("Buyer Type", "خریدار کی قسم")} <span className="text-red-500">*</span>
                    </label>
                    <select id="buyerType" name="buyerType" value={form.buyerType} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        {BUYER_TYPES.map(type => (<option key={type} value={type} disabled={type === BUYER_TYPES[0]}>{type}</option>))}
                    </select>
                </div>

                <InputField label={getLabelWithUrdu("Type of Fraud", "دھوکہ دہی کی قسم")} name="fraudType" value={form.fraudType} onChange={handleChange} required={true} placeholder="e.g., Counterfeit Electronics, Rental Scam, Pyramid Scheme" helpText="Describe the nature of the fraud clearly. (دھوکہ دہی کی نوعیت واضح طور پر بیان کریں)" />

                {/* City Dropdown */}
                <div className="mb-4">
                    <label htmlFor="fraudCity" className="block text-sm font-medium text-gray-700">
                        {getLabelWithUrdu("City or Major Town of Incident", "واقعہ کا شہر یا بڑا قصبہ")} <span className="text-red-500">*</span>
                    </label>
                    <select id="fraudCity" name="fraudCity" value={form.fraudCity} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        {CITIES.map(city => (<option key={city} value={city} disabled={city === CITIES[0]}>{city}</option>))}
                    </select>
                </div>

                {/* CONDITIONAL TEXT INPUT BOX for 'Other' City */}
                {form.fraudCity === OTHER_CITY_OPTION && (
                    <div className="mb-4 pt-2 border-t border-dashed border-gray-300">
                        <label htmlFor="customCity" className="block text-sm font-medium text-gray-700">
                            {getLabelWithUrdu("Custom Location Name", "اپنی مرضی کا مقام")} <span className="text-red-500">*</span>
                        </label>
                        <input id="customCity" type="text" name="customCity" value={form.customCity} onChange={handleCustomCityChange} placeholder="e.g., Kacha Khuh, or a specific village name" required className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-yellow-50" />
                        <p className="mt-1 text-xs text-gray-500">Please enter the specific town or village name here. (براہ کرم یہاں مخصوص قصبے یا گاؤں کا نام درج کریں)</p>
                    </div>
                )}
                
                <InputField label={getLabelWithUrdu("Fraud Person's Name", "دھوکہ دینے والے شخص کا نام")} name="personName" value={form.personName} onChange={handleChange} required={true} placeholder="e.g., John Smith (or 'Unknown')" helpText="The name of the individual involved. (شامل شخص کا نام)" />
                
                {/* NEW: Fraud Mobile Number Field */}
                <InputField 
                    label={getLabelWithUrdu("Fraud Mobile Number (11 Digits)", "دھوکہ باز کا موبائل نمبر (11 ہندسوں کا)")} 
                    name="fraudMobile" 
                    type="tel" 
                    value={form.fraudMobile} 
                    onChange={handleChange} 
                    required={true} 
                    placeholder="e.g., 03XX-XXXXXXX (11 Digits)" 
                    helpText="The mobile number used by the fraudulent person/party. (دھوکہ باز کا استعمال کردہ موبائل نمبر)"
                    maxLength={11} 
                />

                <InputField label={getLabelWithUrdu("CNIC Number (13 Digits)", "قومی شناختی کارڈ نمبر (13 ہندسوں کا)")} 
                    name="cninNumber" 
                    type="text" 
                    value={form.cninNumber} 
                    onChange={handleChange} 
                    required={true} 
                    placeholder="e.g., 4210198765432 (13 Digits, no dashes)" 
                    helpText="The CNIC of the person/party involved. (شامل شخص/فریق کا قومی شناختی کارڈ نمبر)"
                    maxLength={13} 
                />
                
                <InputField label={getLabelWithUrdu("Fraud Business/Organization Name", "دھوکہ دہی والے کاروبار کا نام")} name="fraudBusinessName" value={form.fraudBusinessName} onChange={handleChange} placeholder="The name of the fraudulent company/shop." />

                <InputField label={getLabelWithUrdu("Detailed Description", "تفصیلی وضاحت")} name="moreDetails" type="textarea" value={form.moreDetails} onChange={handleChange} placeholder="Explain what happened, including dates and amounts." required={true} helpText="Be as detailed as possible. (جتنی ممکن ہو تفصیلات سے آگاہ کریں)" />
            </div>

            {/* Upload Pics Section (Evidence) */}
            <div className="border border-gray-200 p-4 sm:p-5 rounded-lg">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                    3. Evidence (Images) - ثبوت (تصاویر)
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Please upload any pictures you have (Max 1 file per type). (براہ کرم کوئی بھی تصویر اپ لوڈ کریں)
                </p>

                {/* Image Upload Fields - Updated to use the 'previews' state */}
                {['shopPic', 'manPic', 'otherPic'].map((name) => (
                    <div key={name} className="flex flex-col mb-4 p-3 border border-dashed rounded-md bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {name === 'shopPic' ? getLabelWithUrdu('Photo of Shop/Location', 'دکان/جگہ کی تصویر') : 
                             name === 'manPic' ? getLabelWithUrdu("Photo of Person (If Available)", "شخص کی تصویر (اگر دستیاب ہو)") : 
                             getLabelWithUrdu('Other Evidence Photo', 'دیگر ثبوت کی تصویر')}
                        </label>
                        <input 
                            type="file" 
                            name={name} 
                            accept="image/*" 
                            onChange={handleChange} 
                            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                        />
                        
                        {/* Image Preview Box */}
                        {previews[name] && ( // Use the previews state for URL
                            <div className="mt-3 p-2 bg-white rounded-md border border-green-300">
                                <p className="text-xs font-semibold text-green-700">Image Preview: (تصویر کا پیش نظارہ)</p>
                                <img 
                                    src={previews[name]} 
                                    alt={`${name} Preview`} 
                                    className="h-24 w-24 object-cover rounded-md mt-1 shadow-sm"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading} // Disable button while loading
                className={`w-full font-semibold py-3 rounded-md shadow-lg transition duration-150 ease-in-out ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
                {loading ? 'Submitting... (رپورٹ جمع ہو رہی ہے)' : 'Submit Fraud Report (دھوکہ دہی کی رپورٹ جمع کرائیں)'}
            </button>
        </form>
    );
}