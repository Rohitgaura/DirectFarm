import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const DataProtectionPolicy = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>डेटा सुरक्षा एवं संरक्षा नीति (Data Protection & Security Policy)</h1>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>DirectFarm अपने सभी उपयोगकर्ताओं के व्यक्तिगत, कृषि और वित्तीय डेटा की गोपनीयता और सुरक्षा को सर्वोपरि मानता है। हम आधुनिक तकनीकों और सुरक्षा प्रोटोकॉल का पालन करते हैं:</p>

                <h2>1. डेटा सुरक्षा उपाय (Data Security Measures)</h2>
                <ul>
                    <li><strong>एसएसएल (SSL/TLS) एन्क्रिप्शन:</strong> वेबसाइट और मोबाइल ऐप पर सभी डेटा ट्रांसमिशन 256-बिट बैंक-ग्रेड एन्क्रिप्शन से सुरक्षित हैं।</li>
                    <li><strong>टोकन-आधारित सुरक्षित प्रमाणीकरण:</strong> सुरक्षित लॉगिन सत्र और अनधिकृत पहुंच को रोकने के लिए JWT टोकन का उपयोग किया जाता है।</li>
                    <li><strong>पासवर्ड एन्क्रिप्शन:</strong> उपयोगकर्ता पासवर्ड कभी भी सादे टेक्स्ट में संग्रहीत नहीं किए जाते; उन्हें सुरक्षित हैशिंग एल्गोरिदम से सुरक्षित किया जाता है।</li>
                    <li><strong>सीमित प्रशासनिक पहुंच:</strong> संवेदनशील डेटा तक पहुंच केवल अधिकृत और प्रशिक्षित तकनीकी कर्मियों तक ही सख्ती से सीमित है।</li>
                    <li><strong>नियमित सुरक्षा परीक्षण:</strong> कमियों और सुरक्षा जोखिमों की पहचान के लिए नियमित सुरक्षा ऑडिट किए जाते हैं।</li>
                </ul>

                <h2>2. संवेदनशील डेटा का संरक्षण (Sensitive Data Protection)</h2>
                <ul>
                    <li>पहचान पत्र (आधार, पैन या बैंक खाता विवरण) केवल सत्यापन उद्देश्यों के लिए एन्क्रिप्टेड प्रारूप में सुरक्षित रखे जाते हैं।</li>
                    <li>उपयोगकर्ता की स्पष्ट सहमति के बिना किसी भी विपणन या विज्ञापन तीसरे पक्ष के साथ कोई डेटा साझा नहीं किया जाता।</li>
                </ul>

                <h2>3. सुरक्षा घटना एवं उल्लंघन रिपोर्टिंग (Incident Reporting)</h2>
                <p>यदि आपको प्लेटफ़ॉर्म पर किसी भी संदिग्ध डेटा उल्लंघन या सुरक्षा जोखिम का संदेह हो, तो कृपया तुरंत हमारी साइबर सुरक्षा टीम से संपर्क करें:</p>
                <p><strong>सुरक्षा ईमेल:</strong> security@directfarm.com / support@directfarm.in</p>
                <p><strong>प्रतिक्रिया समय:</strong> 24 घंटे के भीतर प्रारंभिक समीक्षा</p>

                <h2>4. कानूनी अनुपालन (Compliance)</h2>
                <p>DirectFarm निम्नलिखित भारतीय डेटा संरक्षण एवं साइबर सुरक्षा मानकों का कड़ाई से पालन करता है:</p>
                <ul>
                    <li>सूचना प्रौद्योगिकी अधिनियम, 2000 (Information Technology Act, 2000)।</li>
                    <li>आईटी (उचित सुरक्षा पद्धतियां और प्रक्रियाएं तथा संवेदनशील व्यक्तिगत डेटा) नियम, 2011 (SPDI Rules)।</li>
                    <li>डेटा न्यूनतमकरण सिद्धांत (केवल उतनी ही जानकारी एकत्र की जाती है जितनी सेवा के लिए आवश्यक हो)।</li>
                    <li>उद्देश्य सीमा सिद्धांत (डेटा का उपयोग केवल उसी उद्देश्य के लिए किया जाता है जिसके लिए सहमति दी गई हो)।</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Data Protection & Security Policy</h1>
            <p>Last Updated: November 2024</p>

            <h2>1. Data Security Measures</h2>
            <ul>
                <li>SSL encryption</li>
                <li>Token-based authentication</li>
                <li>Regular penetration tests</li>
                <li>Limited admin access</li>
                <li>Encrypted passwords</li>
            </ul>

            <h2>2. Sensitive Data Protection</h2>
            <ul>
                <li>Aadhaar/PAN (optional) stored encrypted</li>
                <li>No third-party sharing without consent</li>
            </ul>

            <h2>3. Incident Reporting</h2>
            <p>Users can report data breaches at:</p>
            <p>Email: security@directfarm.com</p>

            <h2>4. Compliance</h2>
            <ul>
                <li>IT Act 2000</li>
                <li>SPDI (Sensitive Personal Data) Rules</li>
                <li>Data minimization principle</li>
                <li>Purpose limitation principle</li>
            </ul>
        </div>
    );
};

export default DataProtectionPolicy;
