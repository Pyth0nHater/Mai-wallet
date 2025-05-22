"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Network = {
  name: string
  chainId: number
  rpcUrl: string
  fallbackRpcUrls?: string[]
  explorer: string
  etherscanApi: string
  etherscanApiKey: string
  arbiscanApiKey?: string
}

// Add the API keys
const ETHERSCAN_API_KEY = "N8J2MSW3DU1MXX3YBFI8X6ZATG619ZVTXF"
const ARBISCAN_API_KEY = "YE6VIDGJPQW2CBMTGENF9WSW2F26B3F58R"

export const ETH_NETWORKS: Record<string, Network> = {
  MAINNET: {
    name: "mainnet",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    fallbackRpcUrls: ["https://rpc.ankr.com/eth", "https://ethereum.publicnode.com", "https://cloudflare-eth.com"],
    explorer: "https://etherscan.io",
    etherscanApi: "https://api.etherscan.io/api",
    etherscanApiKey: ETHERSCAN_API_KEY,
  },
  GOERLI: {
    name: "goerli",
    chainId: 5,
    rpcUrl: "https://rpc.ankr.com/eth_goerli",
    fallbackRpcUrls: [
      "https://ethereum-goerli.publicnode.com",
      "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
    explorer: "https://goerli.etherscan.io",
    etherscanApi: "https://api-goerli.etherscan.io/api",
    etherscanApiKey: ETHERSCAN_API_KEY,
  },
  SEPOLIA: {
    name: "sepolia",
    chainId: 11155111,
    rpcUrl: "https://rpc.sepolia.org",
    fallbackRpcUrls: [
      "https://ethereum-sepolia.publicnode.com",
      "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
    explorer: "https://sepolia.etherscan.io",
    etherscanApi: "https://api-sepolia.etherscan.io/api",
    etherscanApiKey: ETHERSCAN_API_KEY,
  },
  ARBITRUM: {
    name: "arbitrum",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    fallbackRpcUrls: ["https://arbitrum-one.publicnode.com", "https://rpc.ankr.com/arbitrum"],
    explorer: "https://arbiscan.io",
    etherscanApi: "https://api.arbiscan.io/api",
    etherscanApiKey: ETHERSCAN_API_KEY,
    arbiscanApiKey: ARBISCAN_API_KEY,
  },
  ARBITRUM_SEPOLIA: {
    name: "arbitrum-sepolia",
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    fallbackRpcUrls: ["https://arbitrum-sepolia.publicnode.com"],
    explorer: "https://sepolia.arbiscan.io",
    etherscanApi: "https://api-sepolia.arbiscan.io/api",
    etherscanApiKey: ETHERSCAN_API_KEY,
    arbiscanApiKey: ARBISCAN_API_KEY,
  },
}

type NetworkContextType = {
  network: Network
  setNetwork: (network: Network) => void
  networkOptions: Network[]
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>(ETH_NETWORKS.MAINNET)
  const networkOptions = Object.values(ETH_NETWORKS)

  return <NetworkContext.Provider value={{ network, setNetwork, networkOptions }}>{children}</NetworkContext.Provider>
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}
