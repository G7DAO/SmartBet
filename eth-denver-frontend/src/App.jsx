import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { hardhat, localhost } from "wagmi/chains";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { Route } from "react-router-dom";

import Home from "./pages/Home";
import Game from "./pages/Game";

const mantleChain = {
  id: 5001,
  name: "Mantle",
  network: "mantle",
  iconUrl:
    "https://pbs.twimg.com/profile_images/1597775748580134914/bLhE1aY1_400x400.jpg",
  nativeCurrency: {
    decimals: 18,
    name: "Bit Token",
    symbol: "BIT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.mantle.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: "https://explorer.testnet.mantle.xyz/",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [hardhat, mantleChain, localhost],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        coolMode
        chains={chains}
        modalSize="compact"
        showRecentTransactions={true}
        theme={lightTheme({
          accentColor: "#C7B9FF",
          accentColorForeground: "black",
          borderRadius: "none",
          fontStack: "system",
        })}
      >
        <Route exact path="/">
          <Home></Home>
        </Route>
        <Route exact path="/session/:id">
          <Game></Game>
        </Route>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
