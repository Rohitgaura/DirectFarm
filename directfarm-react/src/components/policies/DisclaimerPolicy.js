import React from 'react';
import '../../styles/Policy.css';

const DisclaimerPolicy = () => {
    return (
        <div className="policy-container">
            <h1>Disclaimer (Liability Protection)</h1>
            <p>Last Updated: [Add Date]</p>

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
