import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const DeliveryPolicy = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>डिलीवरी एवं लॉजिस्टिक्स नीति (Delivery & Logistics Policy)</h1>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>ताज़ा कृषि उत्पादों को खेत से सीधे खरीदार तक सुरक्षित पहुंचाने के लिए DirectFarm निम्नलिखित पारदर्शी लॉजिस्टिक्स नीतियां प्रदान करता है:</p>

                <h2>1. लॉजिस्टिक्स विकल्प (Logistics Options)</h2>
                <ul>
                    <li><strong>सेल्फ़-पिकअप (खेत से उठाना):</strong> खरीदार सीधे किसान के खेत या गोदाम पर जाकर अपनी गाड़ी से माल उठा सकते हैं।</li>
                    <li><strong>किसान/विक्रेता द्वारा डिलीवरी:</strong> आपसी सहमति पर किसान अपनी गाड़ी या स्थानीय साधन से खरीदार के स्थान तक डिलीवरी कर सकते हैं।</li>
                    <li><strong>खरीदार द्वारा व्यवस्थित परिवहन:</strong> खरीदार अपनी पसंद के किसी भी स्थानीय ट्रांसपोर्टर या लॉजिस्टिक्स वाहन की व्यवस्था कर सकते हैं।</li>
                    <li><strong>प्लेटफ़ॉर्म लॉजिस्टिक्स भागीदार:</strong> भविष्य में एकीकृत पार्टनर वाहनों के माध्यम से सीधी ट्रैकिंग वाली डिलीवरी उपलब्ध कराई जाएगी।</li>
                </ul>

                <h2>2. डिलीवरी समय (Delivery Time)</h2>
                <ul>
                    <li>डिलीवरी का समय किसान के खेत की दूरी, फसल के प्रकार और मौसम की परिस्थितियों पर निर्भर करता है।</li>
                    <li>ऑर्डर फाइनल करते समय और बातचीत (Negotiation) के दौरान आपसी सहमति से अनुमानित समय तय किया जाता है।</li>
                    <li>नाशवान (Perishable) ताज़ी सब्ज़ियों व फलों के लिए उसी दिन या 24 घंटे के भीतर डिलीवरी की अनुशंसा की जाती है।</li>
                </ul>

                <h2>3. पैकेजिंग एवं गुणवत्ता निरीक्षण (Packaging & Inspection)</h2>
                <ul>
                    <li>विक्रेताओं को यह सुनिश्चित करना चाहिए कि उपज को सुरक्षित, साफ़ और मौसम-अनुकूल बोरियों, टोकरियों या क्रेट्स में पैक किया गया हो।</li>
                    <li>खरीदारों या उनके प्रतिनिधियों को डिलीवरी प्राप्त करते समय वजन और बाहरी गुणवत्ता की तुरंत जांच करनी चाहिए।</li>
                </ul>

                <h2>4. अप्रत्याशित देरी (Delivery Delays)</h2>
                <p>DirectFarm निम्नलिखित बाहरी कारणों से होने वाली परिवहन देरी के लिए प्रत्यक्ष रूप से उत्तरदायी नहीं है:</p>
                <ul>
                    <li>सड़क जाम, रूट डायवर्जन या भारी यातायात।</li>
                    <li>अत्यधिक बारिश, बाढ़, कोहरा या प्राकृतिक आपदाएं।</li>
                    <li>परिवहन वाहन की तकनीकी खराबी या ईंधन की कमी।</li>
                    <li>स्थानीय हड़ताल, नाकाबंदी या अप्रत्याशित प्रशासनिक प्रतिबंध।</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Delivery & Logistics Policy</h1>
            <p>Last Updated: November 2024</p>

            <h2>1. Logistics Options</h2>
            <ul>
                <li>Self-pickup</li>
                <li>Seller delivery</li>
                <li>Buyer-arranged transport</li>
                <li>Platform logistics (future version)</li>
            </ul>

            <h2>2. Delivery Time</h2>
            <ul>
                <li>Depends on farmer location, product type.</li>
                <li>Estimated timelines shown during negotiation.</li>
            </ul>

            <h2>3. Packaging</h2>
            <ul>
                <li>Sellers must ensure proper packaging.</li>
                <li>Buyers must check packages upon delivery.</li>
            </ul>

            <h2>4. Delivery Delays</h2>
            <p>DirectFarm is not liable for:</p>
            <ul>
                <li>transport delay</li>
                <li>weather issues</li>
                <li>vehicle breakdown</li>
                <li>external factors</li>
            </ul>
        </div>
    );
};

export default DeliveryPolicy;
