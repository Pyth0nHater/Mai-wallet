import { ethers } from "ethers"
import type { Network } from "@/context/network-context"

// Helper function to create a provider with retry logic
export async function createProvider(network: Network): Promise<ethers.JsonRpcProvider> {
  // Try the main RPC URL first
  try {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl)
    // Test the connection with a simple call
    await provider.getBlockNumber()
    return provider
  } catch (error) {
    console.warn(`Failed to connect to primary RPC: ${network.rpcUrl}`, error)

    // If main RPC fails, try fallbacks
    if (network.fallbackRpcUrls && network.fallbackRpcUrls.length > 0) {
      for (const fallbackUrl of network.fallbackRpcUrls) {
        try {
          const fallbackProvider = new ethers.JsonRpcProvider(fallbackUrl)
          // Test the connection
          await fallbackProvider.getBlockNumber()
          console.log(`Connected to fallback RPC: ${fallbackUrl}`)
          return fallbackProvider
        } catch (fallbackError) {
          console.warn(`Failed to connect to fallback RPC: ${fallbackUrl}`, fallbackError)
        }
      }
    }

    // If all RPCs fail, throw an error
    throw new Error(`Failed to connect to any RPC for ${network.name}`)
  }
}

// Helper function to get balance with retries
export async function getAddressBalance(address: string, network: Network, maxRetries = 3): Promise<ethers.BigInt> {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const provider = await createProvider(network)
      return await provider.getBalance(address)
    } catch (error) {
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error)
      lastError = error

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Failed to get balance after multiple attempts")
}
