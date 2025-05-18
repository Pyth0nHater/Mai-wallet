"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useNetwork } from "@/context/network-context"
import { useWallet } from "@/context/wallet-context"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAddressBalance } from "@/lib/ethereum"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WalletBalance() {
  const { network } = useNetwork()
  const { activeWallet } = useWallet()
  const [address, setAddress] = useState(activeWallet?.address || "")
  const [balance, setBalance] = useState<{
    eth: string
    wei: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Update address when wallet changes
  useEffect(() => {
    if (activeWallet?.address) {
      setAddress(activeWallet.address)
    }
  }, [activeWallet])

  const checkBalance = async () => {
    if (!address) {
      setError("Адрес обязателен")
      return
    }

    if (!ethers.isAddress(address)) {
      setError("Неверный адрес")
      return
    }

    setError("")
    setLoading(true)
    setBalance(null)

    try {
      const balanceWei = await getAddressBalance(address, network)

      setBalance({
        eth: ethers.formatEther(balanceWei),
        wei: balanceWei.toString(),
      })
    } catch (error) {
      console.error("Error checking balance:", error)
      setError(
        `Не удалось проверить баланс: ${error.message || "Ошибка сети"}. Пожалуйста, попробуйте снова или выберите другую сеть.`,
      )
      toast({
        title: "Ошибка",
        description: "Не удалось проверить баланс. Пожалуйста, попробуйте снова или выберите другую сеть.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast({
      title: "Скопировано!",
      description: "Адрес скопирован в буфер обмена",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-check balance when address is set from wallet
  useEffect(() => {
    if (address && ethers.isAddress(address)) {
      checkBalance()
    }
  }, [address, network])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Адрес кошелька</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={copyAddress} className="border-blue-300 hover:bg-blue-50">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-blue-600" />}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Button onClick={checkBalance} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Проверка...
          </>
        ) : (
          "Проверить баланс"
        )}
      </Button>

      {balance && (
        <Card className="mt-4 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Сеть:</span>
                <span>{network.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Адрес:</span>
                <span className="truncate max-w-[250px]">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Баланс:</span>
                <span>{balance.eth} ETH</span>
              </div>

              <div className="pt-2">
                <a
                  href={`${network.explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Посмотреть на{" "}
                  {network.name === "mainnet"
                    ? "Etherscan"
                    : network.name.includes("arbitrum")
                      ? "Arbiscan"
                      : network.name + ".etherscan.io"}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
