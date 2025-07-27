# Web3 Real-Time Chat Room

A decentralized, privacy-first chat platform powered by Web3 technologies, built with Next.js, WebSockets, and blockchain integration.

## 🚀 Features

- **Web3 Authentication**: Connect with MetaMask, WalletConnect, and other Web3 wallets
- **Real-time Messaging**: Instant chat powered by WebSocket connections
- **Decentralized Storage**: Messages stored on IPFS for true data ownership
- **Token-Gated Rooms**: Exclusive access based on NFT/token ownership
- **End-to-End Encryption**: Privacy-first messaging with E2E encryption
- **Crypto Tipping**: Send tips to other users via smart contracts
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Room Management**: Create public, private, and token-gated rooms

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web3**: Wagmi, RainbowKit, Ethers.js
- **Real-time**: Socket.io
- **Storage**: IPFS
- **Authentication**: Web3 wallet signatures
- **Encryption**: Custom encryption service

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- A Web3 wallet (MetaMask recommended)
- IPFS node access (Infura recommended for production)

## 🏁 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Environment Setup

Copy `.env.local` and configure your environment variables:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_IPFS_AUTH=your_ipfs_auth_token
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

### 3. Start the Development Servers

**Terminal 1 - Start the WebSocket server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start the Next.js frontend:**
```bash
npm run dev
```

### 4. Open the Application

Navigate to `http://localhost:3000` and connect your Web3 wallet to start chatting!

## 🏗 Project Structure

```
web3-chat-room/
├── src/
│   ├── app/                 # Next.js 13+ app directory
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main chat page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ChatHeader.tsx   # Chat room header
│   │   ├── RoomList.tsx     # Room list sidebar
│   │   ├── MessageList.tsx  # Message display
│   │   ├── MessageInput.tsx # Message input component
│   │   └── ...              # Other components
│   ├── hooks/              # Custom React hooks
│   │   ├── useSocket.ts    # WebSocket management
│   │   └── useChatStore.ts # Chat state management
│   ├── lib/                # Utility functions
│   │   ├── web3.ts         # Web3 configuration
│   │   ├── ipfs.ts         # IPFS integration
│   │   ├── encryption.ts   # Encryption service
│   │   └── utils.ts        # General utilities
│   └── types/              # TypeScript type definitions
│       └── index.ts        # Chat-related types
├── server/                 # WebSocket server
│   ├── index.js           # Express + Socket.io server
│   └── package.json       # Server dependencies
└── public/                # Static assets
```

## 🔧 Configuration

### Web3 Setup

1. **WalletConnect Project ID**: Get one from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. **Supported Chains**: Configure in `src/lib/web3.ts`
3. **Smart Contracts**: Deploy tipping and room management contracts (optional)

### IPFS Setup

1. **Infura IPFS**: Sign up at [Infura](https://infura.io/) for hosted IPFS
2. **Local IPFS**: Run a local IPFS node for development
3. **Configuration**: Update `src/lib/ipfs.ts` with your settings

### Server Configuration

The WebSocket server handles:
- Real-time message broadcasting
- User authentication via wallet signatures
- Room management
- Typing indicators
- User presence

## 🎯 Usage

### Creating Rooms

1. Click the "+" button in the room list
2. Choose room type:
   - **Public**: Open to everyone
   - **Private**: Invite-only
   - **Token-Gated**: Requires specific token/NFT ownership
3. Configure token requirements if applicable
4. Click "Create Room"

### Sending Messages

1. Connect your Web3 wallet
2. Join a room from the sidebar
3. Type your message and press Enter
4. Messages are automatically encrypted in private/token-gated rooms

### Token-Gated Access

1. Rooms can require:
   - ERC-20 token ownership (minimum amount)
   - NFT ownership from specific collections
2. Access is verified on-chain (simplified in demo)

## 🚀 Deployment

### Frontend (Vercel)

```bash
npm run build
```

Deploy to Vercel, Netlify, or your preferred hosting platform.

### Server (Railway/Heroku)

```bash
cd server
npm start
```

Deploy the WebSocket server to Railway, Heroku, or any Node.js hosting platform.

### Environment Variables (Production)

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=prod_project_id
NEXT_PUBLIC_IPFS_AUTH=prod_ipfs_auth
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-server.com
```

## 🔒 Security Considerations

- **Wallet Authentication**: Messages signed with private keys
- **E2E Encryption**: Private rooms use client-side encryption
- **IPFS Storage**: Immutable message storage
- **Smart Contract Audits**: Audit all deployed contracts
- **Rate Limiting**: Implement on production servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Wallet Connection Issues:**
- Ensure MetaMask is installed and unlocked
- Check that you're on a supported network
- Clear browser cache and try again

**WebSocket Connection Failed:**
- Verify the server is running on port 3001
- Check firewall settings
- Ensure CORS is properly configured

**IPFS Upload Failed:**
- Verify IPFS credentials
- Check network connectivity
- Try with a local IPFS node

### Getting Help

- Create an issue on GitHub
- Check the documentation
- Join our community chat (coming soon!)

## 🚧 Roadmap

- [ ] Smart contract deployment scripts
- [ ] Mobile app (React Native)
- [ ] Voice/video calling
- [ ] File sharing improvements
- [ ] Advanced moderation tools
- [ ] Multi-language support
- [ ] Integration with more blockchains

---

Built with ❤️ by the Web3 community
