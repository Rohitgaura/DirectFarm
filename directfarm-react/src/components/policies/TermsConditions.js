import React from 'react';
import '../../styles/Policy.css';

const TermsConditions = () => {
    return (
        <div className="policy-container">
            <h1>Terms & Conditions (T&C)</h1>
            <p>Last Updated: [Add Date]</p>
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
