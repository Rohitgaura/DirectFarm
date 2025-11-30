import React from 'react';
import '../../styles/Policy.css';

const PrivacyPolicy = () => {
    return (
        <div className="policy-container">
            <h1>Privacy Policy (As per IT Act 2000 & SPDI Rules)</h1>
            <p>Last Updated: [Add Date]</p>
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
            <p>Name: [Add Name]</p>
            <p>Email: [Add Email]</p>
            <p>Response time: Within 72 hours</p>
        </div>
    );
};

export default PrivacyPolicy;
