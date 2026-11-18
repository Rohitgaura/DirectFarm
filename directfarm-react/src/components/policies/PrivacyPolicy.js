import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const PrivacyPolicy = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>गोपनीयता नीति (Privacy Policy)</h1>
                <p>सूचना प्रौद्योगिकी अधिनियम 2000 (IT Act 2000) एवं SPDI नियमों के अनुसार</p>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>DirectFarm आपकी व्यक्तिगत गोपनीयता का पूरा सम्मान करता है और आपकी निजी जानकारी की सुरक्षा एवं पारदर्शिता के लिए पूरी तरह प्रतिबद्ध है।</p>

                <h2>1. हम जो जानकारी एकत्र करते हैं (Information We Collect)</h2>
                <ul>
                    <li>आपका नाम, मोबाइल फ़ोन नंबर, ईमेल पता और निवास/खेत का पता।</li>
                    <li>केवाईसी (KYC) और पहचान सत्यापन विवरण (आधार, पैन या किसान पासबुक यदि लागू हो)।</li>
                    <li>सूचीबद्ध फसलों और उत्पादों का विवरण (मात्रा, मूल्य, कटाई तिथि, तस्वीरें)।</li>
                    <li>स्थान डेटा (Location Data) – ताकि स्थानीय खरीदारों और किसानों को निकटतम दूरी पर जोड़ा जा सके।</li>
                    <li>डिवाइस विवरण, ब्राउज़र प्रकार और आईपी (IP) पता।</li>
                    <li>विवाद समाधान और सुरक्षा के लिए चैट एवं मोलभाव (Negotiation) संदेश लॉग।</li>
                </ul>

                <h2>2. हम आपकी जानकारी का उपयोग कैसे करते हैं (How We Use Your Information)</h2>
                <ul>
                    <li>आपका सुरक्षित खाता बनाने, सत्यापित करने और प्रबंधित करने के लिए।</li>
                    <li>किसानों और सही खरीदारों के बीच त्वरित व उचित मिलान सुनिश्चित करने के लिए।</li>
                    <li>कृषि उत्पादों की व्यक्तिगत और बेहतर सिफारिशें प्रदान करने के लिए।</li>
                    <li>प्लेटफ़ॉर्म पर किसी भी प्रकार की धोखाधड़ी, जाली खातों और दुरुपयोग को रोकने के लिए।</li>
                    <li>ग्राहक सेवा और तकनीकी सहायता को अधिक प्रभावी बनाने के लिए।</li>
                </ul>

                <h2>3. जानकारी साझा करना (Sharing of Information)</h2>
                <p>हम आपकी व्यक्तिगत जानकारी कभी भी किसी तीसरे पक्ष को बेचते या किराए पर नहीं देते हैं। आपका डेटा केवल निम्नलिखित स्थितियों में साझा किया जाता है:</p>
                <ul>
                    <li>सत्यापित लॉजिस्टिक्स और डिलीवरी भागीदारों के साथ (ताकि माल की ढुलाई हो सके)।</li>
                    <li>सत्यापित सुरक्षित भुगतान गेटवे भागीदारों के साथ (लेनदेन पूरा करने के लिए)।</li>
                    <li>सरकारी या कानून प्रवर्तन एजेंसियों के साथ (यदि कानूनी प्रक्रिया या न्यायालय द्वारा अनिवार्य किया जाए)।</li>
                </ul>

                <h2>4. डेटा संग्रहण एवं सुरक्षा (Data Storage & Security)</h2>
                <ul>
                    <li>सभी उपयोगकर्ता डेटा को आधुनिक, सुरक्षित और संरक्षित क्लाउड सर्वरों पर रखा जाता है।</li>
                    <li>डेटा ट्रांसमिशन के दौरान एंड-टू-एंड एसएसएल (SSL/TLS) एन्क्रिप्शन का उपयोग किया जाता है।</li>
                    <li>पासवर्ड और संवेदनशील विवरण उन्नत हैशिंग एल्गोरिदम द्वारा सुरक्षित किए जाते हैं।</li>
                    <li>आंतरिक कर्मचारियों के लिए केवल अनुमति-आधारित सीमित पहुंच (Role-based access) लागू है।</li>
                </ul>

                <h2>5. आपके अधिकार (User Rights)</h2>
                <p>DirectFarm पर प्रत्येक उपयोगकर्ता को निम्नलिखित अधिकार प्राप्त हैं:</p>
                <ul>
                    <li>अपनी प्रोफ़ाइल और व्यक्तिगत जानकारी को कभी भी देखना और अपडेट करना।</li>
                    <li>अपने खाते और व्यक्तिगत डेटा को स्थायी रूप से हटाने का अनुरोध करना।</li>
                    <li>डेटा उपयोग के लिए दी गई अपनी सहमति को कभी भी वापस लेना।</li>
                    <li>किसी भी संदिग्ध या अनधिकृत गतिविधि की तुरंत रिपोर्ट करना।</li>
                </ul>

                <h2>6. कुकीज़ और ट्रैकिंग (Cookies & Tracking)</h2>
                <p>हम अपनी वेब सेवाओं को सुगम बनाने के लिए आवश्यक कुकीज़ का उपयोग करते हैं:</p>
                <ul>
                    <li>उपयोगकर्ता सत्र (Session) को सुरक्षित रखने और लॉगिन स्थिति बनाए रखने के लिए।</li>
                    <li>प्लेटफ़ॉर्म के प्रदर्शन और लोडिंग गति को अनुकूलित करने के लिए।</li>
                </ul>

                <h2>7. शिकायत निवारण अधिकारी (Grievance Officer)</h2>
                <p>आईटी अधिनियम 2000 के तहत शिकायत समाधान संपर्क:</p>
                <p><strong>नाम:</strong> DirectFarm ग्रीवेंस एवं सपोर्ट टीम</p>
                <p><strong>ईमेल:</strong> support@directfarm.in / grievance@directfarm.com</p>
                <p><strong>प्रतिक्रिया समय:</strong> 48 से 72 कार्य घंटों के भीतर</p>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Privacy Policy (As per IT Act 2000 & SPDI Rules)</h1>
            <p>Last Updated: November 2024</p>
            <p>DirectFarm respects your privacy and is committed to protecting your personal information.</p>

            <h2>1. Information We Collect</h2>
            <ul>
                <li>Name, phone number, address</li>
                <li>KYC details (optional / future)</li>
                <li>Product listing data</li>
                <li>Location data (if delivery enabled)</li>
                <li>Device information, IP address</li>
                <li>Chat/Negotiation logs (for dispute resolution)</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
                <li>To create and manage your account</li>
                <li>To match buyers and farmers</li>
                <li>To improve product recommendations</li>
                <li>To prevent fraud</li>
                <li>To enhance app experience</li>
            </ul>

            <h2>3. Sharing of Information</h2>
            <p>We do not sell or rent your data. We may share data with:</p>
            <ul>
                <li>Verified logistics partners</li>
                <li>Payment partners</li>
                <li>Law enforcement (if required)</li>
            </ul>

            <h2>4. Data Storage & Security</h2>
            <ul>
                <li>Data stored on secure servers</li>
                <li>Encrypted where applicable</li>
                <li>Limited employee access</li>
                <li>Regular security audits (phased rollout)</li>
            </ul>

            <h2>5. User Rights</h2>
            <p>You may:</p>
            <ul>
                <li>Update your data</li>
                <li>Request deletion</li>
                <li>Withdraw consent</li>
                <li>Report misuse</li>
            </ul>

            <h2>6. Cookies / Tracking (if web)</h2>
            <p>We use cookies for:</p>
            <ul>
                <li>Login sessions</li>
                <li>Analytics</li>
                <li>Improving performance</li>
            </ul>

            <h2>7. Grievance Officer (Required under IT Act)</h2>
            <p>Name: DirectFarm Support Team</p>
            <p>Email: grievance@directfarm.com</p>
            <p>Response time: Within 72 hours</p>
        </div>
    );
};

export default PrivacyPolicy;
