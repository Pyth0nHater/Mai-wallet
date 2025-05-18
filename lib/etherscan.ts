import type { Network } from "@/context/network-context"

export type EtherscanTransaction = {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
}

export type EtherscanResponse = {
  status: string
  message: string
  result: EtherscanTransaction[]
}

export async function fetchTransactionHistory(address: string, network: Network): Promise<EtherscanTransaction[]> {
  try {
    // Use the appropriate API key based on the network
    const apiKey =
      network.name.includes("arbitrum") && network.arbiscanApiKey ? network.arbiscanApiKey : network.etherscanApiKey

    const apiUrl = `${network.etherscanApi}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`

    const response = await fetch(apiUrl)
    const data: EtherscanResponse = await response.json()

    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result
    } else {
      throw new Error(data.message || "Failed to fetch transactions")
    }
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    throw error
  }
}

export async function fetchInternalTransactions(address: string, network: Network): Promise<EtherscanTransaction[]> {
  try {
    // Use the appropriate API key based on the network
    const apiKey =
      network.name.includes("arbitrum") && network.arbiscanApiKey ? network.arbiscanApiKey : network.etherscanApiKey

    const apiUrl = `${network.etherscanApi}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`

    const response = await fetch(apiUrl)
    const data: EtherscanResponse = await response.json()

    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result
    } else {
      // Return empty array if no internal transactions or error
      return []
    }
  } catch (error) {
    console.error("Error fetching internal transactions:", error)
    // Return empty array on error
    return []
  }
}
