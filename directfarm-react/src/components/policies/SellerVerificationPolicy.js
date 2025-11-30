import React from 'react';
import '../../styles/Policy.css';

const SellerVerificationPolicy = () => {
    return (
        <div className="policy-container">
            <h1>Seller Verification (KYC) Policy</h1>

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
