import React from 'react';
import '../../styles/Policy.css';

const DataProtectionPolicy = () => {
    return (
        <div className="policy-container">
            <h1>Data Protection & Security Policy</h1>

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
            <p>Email: [Add Email]</p>

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
