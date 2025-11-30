import React from 'react';
import '../../styles/Policy.css';

const RefundPolicy = () => {
    return (
        <div className="policy-container">
            <h1>Refund & Cancellation Policy</h1>
            <p>Last Updated: [Add Date]</p>
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
