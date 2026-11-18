import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const TermsConditions = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>नियम एवं शर्तें (Terms & Conditions)</h1>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>DirectFarm में आपका स्वागत है, एक ऐसा डिजिटल मंच जो किसानों को सीधे खरीदारों से जोड़ता है। हमारे प्लेटफ़ॉर्म या एप्लिकेशन का उपयोग करके, आप निम्नलिखित नियमों और शर्तों से पूरी तरह सहमत होते हैं:</p>

                <h2>1. परिभाषाएं (Definitions)</h2>
                <ul>
                    <li><strong>प्लेटफ़ॉर्म</strong> – DirectFarm का आधिकारिक वेब और मोबाइल एप्लिकेशन।</li>
                    <li><strong>उपयोगकर्ता</strong> – प्लेटफ़ॉर्म का उपयोग करने वाला कोई भी किसान, खरीदार, व्यापारी या आगंतुक।</li>
                    <li><strong>विक्रेता</strong> – अपनी उपज या कृषि उत्पाद बिक्री के लिए सूचीबद्ध करने वाला पंजीकृत किसान।</li>
                    <li><strong>खरीदार</strong> – प्लेटफ़ॉर्म के माध्यम से कृषि उत्पाद खरीदने वाला कोई भी उपयोगकर्ता।</li>
                    <li><strong>ऑर्डर</strong> – खरीदार द्वारा की गई पुष्टि की गई खरीद की मांग या अनुरोध।</li>
                </ul>

                <h2>2. प्लेटफ़ॉर्म का उपयोग (Use of Platform)</h2>
                <ul>
                    <li>इस प्लेटफ़ॉर्म का उपयोग करने के लिए आपकी न्यूनतम आयु 18 वर्ष या उससे अधिक होनी चाहिए।</li>
                    <li>आप खाता पंजीकरण के दौरान अपनी सही, सटीक और वैध जानकारी प्रदान करने के लिए सहमत हैं।</li>
                    <li>प्लेटफ़ॉर्म का उपयोग किसी भी गैरकानूनी, धोखाधड़ी, अनधिकृत या हानिकारक गतिविधि के लिए नहीं किया जाना चाहिए।</li>
                </ul>

                <h2>3. मार्केटप्लेस की भूमिका (Marketplace Role)</h2>
                <p>DirectFarm केवल एक मध्यस्थ (Intermediary) तकनीकी मंच है। हम:</p>
                <ul>
                    <li>किसानों और खरीदारों को आपस में सीधे संवाद और व्यापार की सुविधा प्रदान करते हैं।</li>
                    <li>उत्पाद लिस्टिंग, पारदर्शी मूल्य मोलभाव (Negotiation), और संचार उपकरण उपलब्ध कराते हैं।</li>
                </ul>
                <p>हम सीधे तौर पर किसी भी उत्पाद के स्वामी या उत्पादक नहीं हैं, और जब तक स्पष्ट रूप से लिखित न हो, उत्पाद की गुणवत्ता या मात्रा की प्रत्यक्ष गारंटी नहीं देते।</p>

                <h2>4. उपयोगकर्ता की जिम्मेदारियां (User Responsibilities)</h2>
                <ul>
                    <li>किसानों को यह सुनिश्चित करना होगा कि उनके द्वारा दी गई फसल और उत्पाद की जानकारी शत-प्रतिशत सत्य और प्रामाणिक हो।</li>
                    <li>खरीदारों को समय पर भुगतान और सौदे की शर्तों का निष्ठापूर्वक पालन करना होगा।</li>
                    <li>दोनों पक्षों को आपस में पेशेवर, शिष्ट और सम्मानजनक बातचीत बनाए रखनी होगी।</li>
                    <li>किसी भी प्रकार का दुर्व्यवहार, धमकी या भ्रामक आचरण बिल्कुल बर्दाश्त नहीं किया जाएगा।</li>
                </ul>

                <h2>5. मूल्य निर्धारण और भुगतान (Pricing & Payments)</h2>
                <ul>
                    <li>फसलों और उत्पादों की कीमतें सीधे किसानों/विक्रेताओं द्वारा पारदर्शी रूप से तय की जाती हैं।</li>
                    <li>प्लेटफ़ॉर्म भविष्य में अपनी सेवाओं को चालू रखने के लिए न्यूनतम सेवा शुल्क जोड़ सकता है।</li>
                    <li>ऐप और प्लेटफ़ॉर्म के बाहर व्यक्तिगत रूप से किए गए नकद या अन्य अनधिकृत भुगतान के लिए DirectFarm ज़िम्मेदार नहीं होगा।</li>
                </ul>

                <h2>6. ऑर्डर प्रक्रिया (Order Process)</h2>
                <ul>
                    <li>खरीदार उत्पादों को खोज सकते हैं, सीधे मोलभाव कर सकते हैं और ऑर्डर दे सकते हैं।</li>
                    <li>किसानों/विक्रेताओं को उचित समय सीमा के भीतर ऑर्डर पर अपनी पुष्टि या प्रतिक्रिया देनी चाहिए।</li>
                    <li>ऑर्डर का रद्दीकरण प्लेटफ़ॉर्म की रद्दीकरण एवं रिफंड नीति के नियमों के अधीन होगा।</li>
                </ul>

                <h2>7. प्रतिबंधित गतिविधियाँ (Prohibited Activities)</h2>
                <ul>
                    <li>फर्जी या भ्रामक उत्पादों की सूची बनाना।</li>
                    <li>झूठे या धोखाधड़ी वाले ऑर्डर देना।</li>
                    <li>अनुमति के बिना निजी फ़ोन नंबर या व्यक्तिगत संपर्क विवरण साझा करना।</li>
                    <li>आपत्तिजनक, भड़काऊ या हानिकारक सामग्री पोस्ट करना।</li>
                    <li>सौदा करने के लिए जानबूझकर प्लेटफ़ॉर्म को बायपास करने का प्रयास करना।</li>
                </ul>

                <h2>8. खाता निलंबन / समाप्ति (Suspension / Termination)</h2>
                <p>DirectFarm निम्नलिखित कारणों से किसी भी उपयोगकर्ता के खाते को निलंबित या हमेशा के लिए समाप्त कर सकता है:</p>
                <ul>
                    <li>धोखाधड़ी या अनुचित वित्तीय व्यवहार।</li>
                    <li>प्लेटफ़ॉर्म का दुरुपयोग।</li>
                    <li>नीतियों और नियमों का बार-बार उल्लंघन।</li>
                    <li>फर्जी केवाईसी (KYC) या जाली पहचान दस्तावेज़ देना।</li>
                </ul>

                <h2>9. देयता की सीमा (Limitation of Liability)</h2>
                <p>DirectFarm निम्नलिखित परिस्थितियों के लिए प्रत्यक्ष या अप्रत्यक्ष रूप से उत्तरदायी नहीं है:</p>
                <ul>
                    <li>उत्पाद की गुणवत्ता या प्राकृतिक क्षति से जुड़े मुद्दे।</li>
                    <li>परिवहन या अप्रत्याशित कारणों से डिलीवरी में देरी।</li>
                    <li>खरीदार और विक्रेता के बीच व्यक्तिगत भुगतान विवाद।</li>
                    <li>प्लेटफ़ॉर्म से बाहर किए गए किसी भी सौदे से होने वाला नुकसान।</li>
                </ul>

                <h2>10. नियमों में संशोधन (Modifications)</h2>
                <p>हम आवश्यकतानुसार इन नियमों और शर्तों को कभी भी संशोधित कर सकते हैं। महत्वपूर्ण परिवर्तनों की सूचना प्लेटफ़ॉर्म पर दी जाएगी।</p>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Terms & Conditions (T&C)</h1>
            <p>Last Updated: November 2024</p>
            <p>Welcome to DirectFarm, a platform that connects farmers with buyers. By accessing or using our application, you agree to the following Terms & Conditions:</p>

            <h2>1. Definitions</h2>
            <ul>
                <li><strong>Platform</strong> – DirectFarm’s mobile and web application.</li>
                <li><strong>User</strong> – Any farmer, buyer, or visitor using the platform.</li>
                <li><strong>Seller</strong> – A farmer listing products for sale.</li>
                <li><strong>Buyer</strong> – A user who purchases products.</li>
                <li><strong>Order</strong> – A confirmed purchase request by the buyer.</li>
            </ul>

            <h2>2. Use of Platform</h2>
            <ul>
                <li>You must be 18 years or older to use the platform.</li>
                <li>You agree to provide accurate information during registration.</li>
                <li>You must not misuse the platform for illegal, fraudulent, or harmful activities.</li>
            </ul>

            <h2>3. Marketplace Role</h2>
            <p>DirectFarm is only an intermediary. We:</p>
            <ul>
                <li>connect farmers and buyers</li>
                <li>provide listing, negotiation, and communication features</li>
            </ul>
            <p>We do not own any product, nor guarantee quality or quantity unless explicitly stated.</p>

            <h2>4. User Responsibilities</h2>
            <ul>
                <li>Farmers must ensure product details are truthful.</li>
                <li>Buyers must ensure timely payment (if any digital transactions are enabled).</li>
                <li>Both parties must maintain respectful communication.</li>
                <li>No abusive, threatening, or misleading behavior will be tolerated.</li>
            </ul>

            <h2>5. Pricing & Payments</h2>
            <ul>
                <li>Prices are set by the sellers.</li>
                <li>Platform may charge a small platform fee in future (not mandatory in MVP).</li>
                <li>DirectFarm is not responsible for offline payments done outside the app.</li>
            </ul>

            <h2>6. Order Process</h2>
            <ul>
                <li>Buyers can browse, negotiate (if enabled), and order products.</li>
                <li>Sellers must respond within a reasonable time.</li>
                <li>Cancellations must follow the cancellation policy.</li>
            </ul>

            <h2>7. Prohibited Activities</h2>
            <ul>
                <li>Fake listings</li>
                <li>Fraudulent orders</li>
                <li>Sharing private contact numbers outside permitted methods</li>
                <li>Posting abusive or harmful content</li>
                <li>Attempting to bypass the platform for deals</li>
            </ul>

            <h2>8. Suspension / Termination</h2>
            <p>DirectFarm may suspend or block users for:</p>
            <ul>
                <li>Fraud</li>
                <li>Misuse</li>
                <li>Violating policies</li>
                <li>Fake KYC or identity details</li>
            </ul>

            <h2>9. Limitation of Liability</h2>
            <p>DirectFarm is not liable for:</p>
            <ul>
                <li>Product quality issues</li>
                <li>Delayed delivery</li>
                <li>Payment disputes</li>
                <li>Buyer–seller disagreements</li>
                <li>Any losses arising from transactions outside the platform</li>
            </ul>

            <h2>10. Modifications</h2>
            <p>We may update these terms at any time with prior notice.</p>
        </div>
    );
};

export default TermsConditions;
