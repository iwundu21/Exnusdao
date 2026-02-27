# **App Name**: EXN Staker

## Core Features:

- Solana Wallet Integration: Securely connect to Solana wallets (e.g., Phantom) to manage and sign transactions.
- Validator Node Registration: Allow users to register their own validator nodes by providing a name and commission percentage, interacting with the Solana program.
- Validator Commission Management: Users can update their node's commission rate and withdraw accumulated commissions.
- Validator Node Discovery: Display a list of registered validator nodes for users to browse, select, and view basic information.
- Global Reward Cranking: Enable a designated administrator to trigger the global reward distribution process across the protocol.
- Token Staking: Enable users to stake EXN tokens with a chosen validator for a specified lock-up period and view their current staked amount and lock-up duration.
- Reward Claiming: Allow users to claim earned rewards from their staked EXN tokens into their associated token account.
- Token Unstaking: Provide functionality for users to unstake their EXN tokens after the lock-up period, returning them to their associated token account.
- Associated Token Account (ATA) Management: Automatically get or create an Associated Token Account for the user to handle EXN token transactions efficiently.
- Dynamic Input Forms: Provide interactive input fields and dropdowns for staking amount, lock-up duration, node names, commission settings, and admin parameters.
- Application State Loading: Asynchronously load and display relevant data such as the global protocol state, list of validators, and user stake information.
- User Feedback and Error Handling: Provide visual feedback for loading states and display clear error messages for failed transactions or operations.
- Admin Protocol Initialization: Allow a designated administrator to initialize the staking protocol.
- Admin Emission Rate Management: Allow a designated administrator to update the EXN token emission rate for the protocol.
- Admin Protocol Pause/Unpause: Allow a designated administrator to pause and unpause the staking protocol, controlling its operational state.
- Admin Treasury Management: Allow a designated administrator to withdraw accumulated funds from the protocol's treasury vault.
- Admin Validator Approval: Allow a designated administrator to approve newly registered validators, enabling them to participate in the staking network.
- Admin Validator Slashing: Allow a designated administrator to penalize (slash) validators for misconduct or non-compliance.
- Admin Access Control: Implement role-based access control to restrict sensitive administrative functions to the protocol's designated authority.

## Style Guidelines:

- A deep radial gradient from dark blues (#0f172a to #020617) creates a sophisticated, dark-themed canvas for the application, complemented by white text.
- A vibrant linear gradient from cyan (#00f5ff) to purple (#a855f7) is applied to main titles and interactive button backgrounds for a dynamic, high-tech visual flair.
- Interactive elements like inputs and selects feature a 1px solid cyan border (#00f5ff) for clear definition, while card backgrounds are subtly transparent (rgba(255,255,255,0.05)) with a faint border (rgba(0,255,255,0.2)).
- Input fields and select boxes use a dark background (#0f172a) that contrasts with the white text. Button text is black for readability against its gradient background. Error messages are displayed prominently in red.
- The application primarily uses 'Arial' for all text, ensuring clear and straightforward readability. Main titles are set at 32px, utilizing a gradient text fill.
- Use minimalist, line-art icons that reflect blockchain concepts like wallets, staking, and network nodes, maintaining a sleek and professional look (conceptual, not implemented in provided code).
- A full-height layout with 40px padding ensures ample space. Features are organized into distinct, card-like sections, using 20px top margins and 16px border-radius. Input elements are block-level with 10px vertical margins, and buttons have 5px margins.
- Card sections incorporate a 12px backdrop blur filter, providing a modern depth effect and subtle visual separation.