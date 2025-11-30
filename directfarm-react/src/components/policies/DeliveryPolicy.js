import React from 'react';
import '../../styles/Policy.css';

const DeliveryPolicy = () => {
    return (
        <div className="policy-container">
            <h1>Delivery & Logistics Policy</h1>

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
