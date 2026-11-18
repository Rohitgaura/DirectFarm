import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Policy.css';

const RefundPolicy = () => {
    const { language } = useLanguage();
    const isHi = language === 'hi';

    if (isHi) {
        return (
            <div className="policy-container">
                <h1>रिफंड एवं रद्दीकरण नीति (Refund & Cancellation Policy)</h1>
                <p>अंतिम नवीनीकरण: नवंबर 2024</p>
                <p>चूंकि DirectFarm किसानों और खरीदारों के बीच एक पारदर्शी मध्यस्थ मंच के रूप में कार्य करता है, इसलिए दोनों पक्षों के हितों की रक्षा के लिए निम्नलिखित नियम लागू होते हैं:</p>

                <h2>1. ऑर्डर रद्दीकरण (Order Cancellation)</h2>
                <ul>
                    <li>खरीदार किसी भी ऑर्डर को किसान/विक्रेता द्वारा पुष्टि (Confirm) किए जाने से पहले बिना किसी शुल्क के रद्द कर सकते हैं।</li>
                    <li>यदि किसी अप्रत्याशित कारण से फसल या स्टॉक अनुपलब्ध हो जाता है, तो विक्रेता ऑर्डर को समय रहते रद्द कर सकते हैं और खरीदार को सूचित किया जाएगा।</li>
                    <li>एक बार ऑर्डर लोड होने या डिलीवरी के लिए प्रस्थान करने के बाद, सामान्यतः रद्दीकरण स्वीकार्य नहीं होगा।</li>
                </ul>

                <h2>2. रिफंड प्रक्रिया (Refunds)</h2>
                <h3>ऑनलाइन डिजिटल भुगतान के लिए:</h3>
                <ul>
                    <li>मान्य रद्दीकरण की स्थिति में रिफंड 5 से 7 कार्य दिवसों के भीतर उसी मूल भुगतान माध्यम (बैंक खाता/यूपीआई/कार्ड) में वापस कर दिया जाएगा।</li>
                    <li>रिफंड प्रक्रिया संबंधित भुगतान गेटवे और बैंकिंग भागीदारों के नियमों के अनुसार पूरी की जाती है।</li>
                </ul>
                <h3>नकद या ऑफ-प्लेटफ़ॉर्म लेनदेन के लिए:</h3>
                <ul>
                    <li>DirectFarm ऐप के बाहर सीधे किए गए किसी भी नकद या अनधिकृत भुगतान के लिए उत्तरदायी नहीं है।</li>
                </ul>

                <h2>3. खराब या गलत उत्पाद (Wrong / Damaged Products)</h2>
                <p>यदि खरीदार को डिलीवरी के समय निम्नलिखित समस्याएं मिलती हैं:</p>
                <ul>
                    <li>सड़ी-गली या खराब गुणवत्ता वाली कृषि उपज।</li>
                    <li>ऑर्डर की गई मात्रा से कम या गलत वस्तु।</li>
                    <li>सूचीबद्ध विनिर्देशों से मेल न खाने वाला उत्पाद।</li>
                </ul>
                <p>खरीदार डिलीवरी प्राप्त होने के <strong>24 घंटे के भीतर</strong> फ़ोटो या साक्ष्य के साथ सहायता अनुभाग में शिकायत दर्ज करा सकते हैं।</p>

                <h2>4. विवाद समाधान (Dispute Resolution)</h2>
                <p>DirectFarm दोनों पक्षों की सुरक्षा के लिए प्रतिबद्ध है:</p>
                <ul>
                    <li>प्लेटफ़ॉर्म किसान और खरीदार दोनों पक्षों से तस्वीरें, रसीदें और तथ्य एकत्र करेगा।</li>
                    <li>हमारी मध्यस्थता टीम पूरी निष्पक्षता से मामले की जांच करेगी और 48 घंटे में समाधान प्रस्तुत करेगी।</li>
                    <li>गंभीर त्रुटि की स्थिति में खरीदार को आनुपातिक रिफंड या समायोजन की व्यवस्था की जाएगी।</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="policy-container">
            <h1>Refund & Cancellation Policy</h1>
            <p>Last Updated: November 2024</p>
            <p>Since DirectFarm acts as an intermediary:</p>

            <h2>1. Order Cancellation</h2>
            <ul>
                <li>Buyers may cancel an order before the seller confirms it.</li>
                <li>Sellers may cancel if stock is unavailable.</li>
            </ul>

            <h2>2. Refunds</h2>
            <h3>For online payments (if enabled):</h3>
            <ul>
                <li>Refunds processed within 5–7 working days.</li>
                <li>Refund depends on payment partner rules.</li>
            </ul>
            <h3>For cash/offline payments:</h3>
            <ul>
                <li>DirectFarm is not responsible.</li>
            </ul>

            <h2>3. Wrong / Damaged Products</h2>
            <p>If buyers receive:</p>
            <ul>
                <li>rotten goods</li>
                <li>wrong quantity</li>
                <li>poor quality</li>
            </ul>
            <p>They can raise a complaint within 24 hours.</p>

            <h2>4. Dispute Resolution</h2>
            <p>Platform will:</p>
            <ul>
                <li>collect both sides’ proofs</li>
                <li>take fair action</li>
                <li>refund/penalize if required in future versions</li>
            </ul>
        </div>
    );
};

export default RefundPolicy;
