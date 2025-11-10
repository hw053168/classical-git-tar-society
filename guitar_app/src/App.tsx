import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Import a local CSS file for styling
import "./App.css";

// Import the wallet adapter's CSS
import "@solana/wallet-adapter-react-ui/styles.css";

// We will create this component next
import { Contest } from "./components/Contest";

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], [network]); // Auto-detects Phantom, etc.

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Main App Layout */}
          <div className="app-container">
            <header className="app-header">
              <h1>🎸 Classical Guitar Peg Society</h1>
              <WalletMultiButton />
            </header>
            
            <main>
              {/* This is where our app logic will go */}
              <Contest />
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
