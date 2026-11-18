import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const SellerVerificationPolicy = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>विक्रेता सत्यापन (KYC) नीति (Seller Verification Policy)</h1>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>DirectFarm पर केवल वास्तविक और विश्वसनीय किसान व विक्रेता ही उत्पाद बेच सकें, इसके लिए हमारी एक मजबूत और पारदर्शी सत्यापन (Know Your Customer) प्रणाली है:</p>

                <h2>1. सत्यापन क्यों आवश्यक है (Why Verification is Needed)</h2>
                <ul>
                    <li><strong>धोखाधड़ी और बिचौलियों पर रोक:</strong> यह सुनिश्चित करना कि प्लेटफ़ॉर्म पर केवल वास्तविक उत्पादक और किसान ही पंजीकृत हों।</li>
                    <li><strong>खरीदार विश्वास का निर्माण:</strong> सत्यापित किसानों से सीधे खरीद करने पर खरीदारों को फसल की प्रामाणिकता का भरोसा मिलता है।</li>
                    <li><strong>गुणवत्ता और पारदर्शिता:</strong> विवादों को कम करना और सीधे किसान-व्यापारी रिश्ते को बढ़ावा देना।</li>
                </ul>

                <h2>2. स्वीकार्य दस्तावेज़ (Accepted Documents)</h2>
                <ul>
                    <li><strong>पहचान पत्र:</strong> आधार कार्ड, पैन कार्ड या मतदाता पहचान पत्र (Voter ID)।</li>
                    <li><strong>कृषि साक्ष्य (वैकल्पिक/प्रासंगिक):</strong> किसान क्रेडिट कार्ड (KCC), खतौनी/जमीन का दस्तावेज़, या किसान पंजीकरण पासबुक।</li>
                    <li><strong>सक्रिय बैंक विवरण:</strong> खाता धारक का नाम और आईएफएससी (IFSC) कोड (डिजिटल भुगतान निपटान के लिए)।</li>
                </ul>

                <h2>3. सत्यापन प्रक्रिया (Verification Steps)</h2>
                <ul>
                    <li>उपयोगकर्ता अपने प्रोफ़ाइल अनुभाग में स्पष्ट फ़ोटो या पीडीएफ दस्तावेज़ अपलोड करता है।</li>
                    <li>हमारी सत्यापन टीम और स्वचालित प्रणाली दस्तावेज़ों की प्रामाणिकता की जांच करती है।</li>
                    <li>सत्यापन प्रक्रिया आमतौर पर <strong>24 से 48 कार्य घंटों</strong> के भीतर पूरी कर ली जाती है।</li>
                    <li>सफलतापूर्वक सत्यापित होने पर किसान की प्रोफ़ाइल पर एक हरा सत्यापित बैच (Verified Farmer Badge) प्रदर्शित होता है।</li>
                </ul>

                <h2>4. फर्जी या भ्रामक दस्तावेज़ (False Documents & Penalties)</h2>
                <p>यदि कोई उपयोगकर्ता जाली, संपादित या किसी अन्य व्यक्ति के दस्तावेज़ प्रस्तुत करता है:</p>
                <ul>
                    <li>संबंधित खाते को बिना पूर्व सूचना के तुरंत स्थायी रूप से निलंबित (Ban) कर दिया जाएगा।</li>
                    <li>गंभीर धोखाधड़ी के मामलों में लागू कानूनों के तहत कानूनी कार्रवाई की जा सकती है।</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Seller Verification (KYC) Policy</h1>
            <p>Last Updated: November 2024</p>

            <h2>1. Why KYC is Needed</h2>
            <ul>
                <li>Prevent fraud</li>
                <li>Ensure genuine farmers</li>
                <li>Build buyer trust</li>
            </ul>

            <h2>2. KYC Documents Accepted</h2>
            <ul>
                <li>Aadhaar</li>
                <li>PAN</li>
                <li>Voter ID</li>
                <li>Farmer passbook (if applicable)</li>
            </ul>

            <h2>3. Verification Steps</h2>
            <ul>
                <li>User uploads document</li>
                <li>Automated or manual verification</li>
                <li>Approval or rejection within 48 hours</li>
            </ul>

            <h2>4. False Documents</h2>
            <ul>
                <li>Account suspension</li>
                <li>Legal action (if required)</li>
            </ul>
        </div>
    );
};

export default SellerVerificationPolicy;
