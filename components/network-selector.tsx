"use client"

import { useNetwork, ETH_NETWORKS } from "@/context/network-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function NetworkSelector() {
  const { network, setNetwork, networkOptions } = useNetwork()

  const handleNetworkChange = (value: string) => {
    const selectedNetwork = Object.values(ETH_NETWORKS).find((n) => n.name === value)
    if (selectedNetwork) {
      setNetwork(selectedNetwork)
    }
  }

  // Translate network names to Russian
  const getNetworkName = (name: string) => {
    const networkNames: Record<string, string> = {
      mainnet: "Mainnet",
      goerli: "Goerli",
      sepolia: "Sepolia",
      arbitrum: "Arbitrum",
      "arbitrum-sepolia": "Arbitrum Sepolia",
    }
    return networkNames[name] || name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <div className="flex items-center space-x-4">
      <Label htmlFor="network" className="text-blue-700">
        Сеть:
      </Label>
      <Select value={network.name} onValueChange={handleNetworkChange}>
        <SelectTrigger id="network" className="w-[180px] border-blue-300 bg-white">
          <SelectValue placeholder="Выберите сеть" />
        </SelectTrigger>
        <SelectContent>
          {networkOptions.map((option) => (
            <SelectItem key={option.name} value={option.name}>
              {getNetworkName(option.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
