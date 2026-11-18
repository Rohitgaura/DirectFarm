import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const DisclaimerPolicy = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>अस्वीकरण (Disclaimer & Liability Protection)</h1>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>DirectFarm एक तकनीकी प्लेटफ़ॉर्म है जिसका उद्देश्य किसानों और खरीदारों के बीच पारदर्शी संवाद और सीधे संपर्क को सक्षम बनाना है। कृपया निम्नलिखित कानूनी अस्वीकरण को ध्यानपूर्वक पढ़ें:</p>

                <h2>1. मार्केटप्लेस अस्वीकरण (Marketplace Disclaimer)</h2>
                <p>DirectFarm केवल एक मध्यस्थ (Intermediary Platform) के रूप में कार्य करता है। हम:</p>
                <ul>
                    <li>प्लेटफ़ॉर्म पर सूचीबद्ध कृषि उत्पादों के प्रत्यक्ष उत्पादक, निर्माता या भौतिक स्वामी नहीं हैं।</li>
                    <li>किसी भी उत्पाद की अंतिम गुणवत्ता, ताजगी या शेल्फ-लाइफ की प्रत्यक्ष गारंटी नहीं देते हैं (जब तक कि हमारे द्वारा लिखित रूप से प्रमाणित न किया गया हो)।</li>
                    <li>किसानों और खरीदारों के बीच होने वाले व्यक्तिगत मूल्य मोलभाव या बातचीत में प्रत्यक्ष पक्षकार नहीं हैं।</li>
                    <li>किसी भी उपयोगकर्ता को लेनदेन पूरा करने के लिए बाध्य नहीं करते हैं।</li>
                </ul>

                <h2>2. देयता सीमा (Limitation of Liability)</h2>
                <p>कानून द्वारा अनुमत अधिकतम सीमा तक, DirectFarm निम्नलिखित के लिए ज़िम्मेदार या उत्तरदायी नहीं होगा:</p>
                <ul>
                    <li>फसलों की प्राकृतिक क्षति, वजन में कमी या मौसम के प्रभाव से होने वाला नुकसान।</li>
                    <li>खरीदार और किसान के बीच आपसी भुगतान में चूक या देरी।</li>
                    <li>प्लेटफ़ॉर्म के बाहर उपयोगकर्ताओं द्वारा किए गए अनौपचारिक सौदे या आपसी विवाद।</li>
                    <li>किसी भी प्रकार का अप्रत्यक्ष, आकस्मिक, दंडात्मक या परिणामी नुकसान।</li>
                </ul>

                <h2>3. बाहरी लिंक और सेवाएँ (External Links & Services)</h2>
                <p>यदि हमारी वेबसाइट या ऐप में तृतीय-पक्ष सेवाएं (जैसे मानचित्र, लॉजिस्टिक्स पार्टनर्स या बैंकिंग गेटवे) के लिंक शामिल हैं, तो उन बाहरी साइटों की सामग्री या नीतियों के लिए DirectFarm ज़िम्मेदार नहीं है।</p>

                <h2>4. कोई आधिकारिक या पेशेवर सलाह नहीं (No Professional Advice)</h2>
                <p>प्लेटफ़ॉर्म पर प्रदर्शित मौसम पूर्वानुमान, बाज़ार भाव रुझान या खेती संबंधी सुझाव केवल सामान्य सूचनात्मक और संदर्भ उद्देश्यों के लिए हैं। इन्हें किसी वित्तीय, कानूनी या पेशेवर कृषि सलाह के रूप में नहीं माना जाना चाहिए।</p>

                <h2>5. अपरिहार्य परिस्थितियां (Force Majeure)</h2>
                <p>हम ऐसे किसी भी विलंब या विफलता के लिए उत्तरदायी नहीं हैं जो हमारे उचित नियंत्रण से परे परिस्थितियों के कारण उत्पन्न होते हैं, जिनमें शामिल हैं:</p>
                <ul>
                    <li>बाढ़, चक्रवात, सूखा, ओलावृष्टि या अन्य प्राकृतिक आपदाएं।</li>
                    <li>राष्ट्रव्यापी या स्थानीय हड़ताल, दंगे, तालाबंदी या प्रशासनिक प्रतिबंध।</li>
                    <li>टेलीकॉम, इंटरनेट या क्लाउड नेटवर्क में व्यापक विफलता।</li>
                    <li>महामारी या अप्रत्याशित सरकारी नियम व प्रतिबंध।</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Disclaimer (Liability Protection)</h1>
            <p>Last Updated: November 2024</p>

            <h2>1. Marketplace Disclaimer</h2>
            <p>DirectFarm is a platform only. We do not:</p>
            <ul>
                <li>own or produce the goods</li>
                <li>guarantee quality</li>
                <li>participate in negotiation</li>
                <li>force users to complete transactions</li>
            </ul>

            <h2>2. Liability</h2>
            <p>DirectFarm is not responsible for:</p>
            <ul>
                <li>losses</li>
                <li>disputes</li>
                <li>frauds</li>
                <li>delays</li>
                <li>miscommunication</li>
            </ul>

            <h2>3. External Links</h2>
            <p>If the app contains external links (maps, logistics), we are not responsible for third-party content.</p>

            <h2>4. No Professional Advice</h2>
            <p>Any farming guidance shown is informational only.</p>

            <h2>5. Force Majeure</h2>
            <p>We are not responsible for events beyond control like:</p>
            <ul>
                <li>floods</li>
                <li>strikes</li>
                <li>network failure</li>
                <li>natural disasters</li>
            </ul>
        </div>
    );
};

export default DisclaimerPolicy;
