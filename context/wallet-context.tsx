"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type WalletInfo = {
  id: string // Unique identifier for the wallet
  name: string // User-friendly name
  address: string
  privateKey: string
  mnemonic?: string
  publicKey?: string
}

type WalletContextType = {
  wallets: WalletInfo[]
  activeWallet: WalletInfo | null
  setActiveWallet: (wallet: WalletInfo | null) => void
  addWallet: (wallet: Omit<WalletInfo, "id">) => void
  updateWallet: (id: string, updates: Partial<Omit<WalletInfo, "id">>) => void
  removeWallet: (id: string) => void
  clearWallets: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [activeWallet, setActiveWalletState] = useState<WalletInfo | null>(null)

  // Load wallets from localStorage on initial render
  useEffect(() => {
    const savedWallets = localStorage.getItem("walletData")
    const activeWalletId = localStorage.getItem("activeWalletId")

    if (savedWallets) {
      try {
        const parsedWallets = JSON.parse(savedWallets) as WalletInfo[]
        setWallets(parsedWallets)

        // Set active wallet if it exists
        if (activeWalletId) {
          const active = parsedWallets.find((w) => w.id === activeWalletId) || null
          setActiveWalletState(active)
        } else if (parsedWallets.length > 0) {
          // Default to first wallet if no active wallet is set
          setActiveWalletState(parsedWallets[0])
        }
      } catch (error) {
        console.error("Failed to parse wallet data from localStorage:", error)
        localStorage.removeItem("walletData")
        localStorage.removeItem("activeWalletId")
      }
    }
  }, [])

  // Save wallets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("walletData", JSON.stringify(wallets))
  }, [wallets])

  // Save active wallet ID to localStorage whenever it changes
  useEffect(() => {
    if (activeWallet) {
      localStorage.setItem("activeWalletId", activeWallet.id)
    } else {
      localStorage.removeItem("activeWalletId")
    }
  }, [activeWallet])

  const setActiveWallet = (wallet: WalletInfo | null) => {
    setActiveWalletState(wallet)
  }

  const addWallet = (walletData: Omit<WalletInfo, "id">) => {
    const newWallet: WalletInfo = {
      ...walletData,
      id: `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }

    const updatedWallets = [...wallets, newWallet]
    setWallets(updatedWallets)

    // If this is the first wallet, make it active
    if (updatedWallets.length === 1) {
      setActiveWalletState(newWallet)
    }

    return newWallet
  }

  const updateWallet = (id: string, updates: Partial<Omit<WalletInfo, "id">>) => {
    const updatedWallets = wallets.map((wallet) => (wallet.id === id ? { ...wallet, ...updates } : wallet))

    setWallets(updatedWallets)

    // Update active wallet if it was modified
    if (activeWallet && activeWallet.id === id) {
      const updatedActiveWallet = updatedWallets.find((w) => w.id === id) || null
      setActiveWalletState(updatedActiveWallet)
    }
  }

  const removeWallet = (id: string) => {
    const updatedWallets = wallets.filter((wallet) => wallet.id !== id)
    setWallets(updatedWallets)

    // If active wallet was removed, set a new active wallet
    if (activeWallet && activeWallet.id === id) {
      setActiveWalletState(updatedWallets.length > 0 ? updatedWallets[0] : null)
    }
  }

  const clearWallets = () => {
    setWallets([])
    setActiveWalletState(null)
    localStorage.removeItem("walletData")
    localStorage.removeItem("activeWalletId")
  }

  return (
    <WalletContext.Provider
      value={{
        wallets,
        activeWallet,
        setActiveWallet,
        addWallet,
        updateWallet,
        removeWallet,
        clearWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
