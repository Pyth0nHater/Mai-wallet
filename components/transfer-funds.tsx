"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useNetwork } from "@/context/network-context"
import { useWallet } from "@/context/wallet-context"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createProvider } from "@/lib/ethereum"

type TransferResult = {
  network: string
  fromAddress: string
  toAddress: string
  amount: string
  txHash: string
  explorerUrl: string
  gasUsed: string
  gasPrice: string
}

export default function TransferFunds() {
  const { network } = useNetwork()
  const { activeWallet } = useWallet()
  const [fromAddress, setFromAddress] = useState(activeWallet?.address || "")
  const [privateKey, setPrivateKey] = useState(activeWallet?.privateKey || "")
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Update address and private key when wallet changes
  useEffect(() => {
    if (activeWallet) {
      setFromAddress(activeWallet.address)
      setPrivateKey(activeWallet.privateKey)
    }
  }, [activeWallet])

  const validateInputs = () => {
    if (!fromAddress || !privateKey || !toAddress || !amount) {
      setError("Все поля обязательны")
      return false
    }

    if (!ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      setError("Неверный адрес")
      return false
    }

    try {
      const amountFloat = Number.parseFloat(amount)
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setError("Сумма должна быть положительным числом")
        return false
      }
    } catch (e) {
      setError("Неверная сумма")
      return false
    }

    return true
  }

  const transferFunds = async () => {
    if (!validateInputs()) return

    setError("")
    setLoading(true)

    try {
      const provider = await createProvider(network)
      const wallet = new ethers.Wallet(privateKey, provider)

      // Verify the wallet address matches the from address
      if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
        setError("Приватный ключ не соответствует адресу отправителя")
        setLoading(false)
        return
      }

      // Check balance before sending
      const balance = await provider.getBalance(wallet.address)
      const value = ethers.parseEther(amount)
      const estimatedGas = await provider.estimateGas({
        from: fromAddress,
        to: toAddress,
        value,
      })
      const gasPrice = await provider.getFeeData()

      const totalCost = estimatedGas * gasPrice.gasPrice + value

      if (balance < totalCost) {
        setError(`Недостаточно средств. Вам нужно как минимум ${ethers.formatEther(totalCost)} ETH (включая газ).`)
        setLoading(false)
        return
      }

      // Send transaction
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value,
        gasLimit: estimatedGas,
      })

      setTransferResult({
        network: network.name,
        fromAddress,
        toAddress,
        amount: ethers.formatEther(value),
        txHash: tx.hash,
        explorerUrl: `${network.explorer}/tx/${tx.hash}`,
        gasUsed: estimatedGas.toString(),
        gasPrice: gasPrice.gasPrice?.toString() || "0",
      })

      toast({
        title: "Транзакция отправлена",
        description: "Ваша транзакция успешно отправлена!",
      })
    } catch (error) {
      console.error("Transfer error:", error)

      if (error.message?.includes("insufficient funds")) {
        setError("Недостаточно средств для этой транзакции")
      } else {
        setError(`Ошибка транзакции: ${error.message || "Неизвестная ошибка"}`)
      }

      toast({
        title: "Ошибка транзакции",
        description: "Произошла ошибка при отправке транзакции.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Предупреждение</AlertTitle>
        <AlertDescription>
          Никогда не вводите свой приватный ключ на сайтах, которым вы не доверяете полностью. Это приложение работает
          полностью в вашем браузере, но вы всегда должны быть осторожны.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="fromAddress">Адрес отправителя</Label>
        <Input
          id="fromAddress"
          placeholder="0x..."
          value={fromAddress}
          onChange={(e) => setFromAddress(e.target.value)}
          disabled={!!activeWallet}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="privateKey">Приватный ключ</Label>
        <Input
          id="privateKey"
          type="password"
          placeholder="Введите ваш приватный ключ"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          disabled={!!activeWallet}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toAddress">Адрес получателя</Label>
        <Input id="toAddress" placeholder="0x..." value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Сумма (ETH)</Label>
        <Input
          id="amount"
          type="number"
          step="0.0001"
          min="0"
          placeholder="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button onClick={transferFunds} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          "Отправить транзакцию"
        )}
      </Button>

      {transferResult && (
        <Card className="mt-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Статус:</span>
                <span className="text-green-600">Транзакция отправлена</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Сеть:</span>
                <span>{transferResult.network}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">От:</span>
                <span className="text-sm break-all">{transferResult.fromAddress}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Кому:</span>
                <span className="text-sm break-all">{transferResult.toAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Сумма:</span>
                <span>{transferResult.amount} ETH</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Хэш транзакции:</span>
                <span className="text-sm break-all">{transferResult.txHash}</span>
              </div>
              <div className="pt-2">
                <a
                  href={transferResult.explorerUrl}
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
