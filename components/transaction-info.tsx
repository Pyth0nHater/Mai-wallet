"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useNetwork } from "@/context/network-context"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createProvider } from "@/lib/ethereum"
import { Alert, AlertDescription } from "@/components/ui/alert"

type TransactionDetails = {
  network: string
  txHash: string
  status: string
  blockNumber: number
  from: string
  to: string
  value: string
  gasUsed: string
  explorerUrl: string
}

export default function TransactionInfo() {
  const { network } = useNetwork()
  const [txHash, setTxHash] = useState("")
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const getTransactionInfo = async () => {
    if (!txHash) {
      setError("Хэш транзакции обязателен")
      return
    }

    setError("")
    setLoading(true)
    setTxDetails(null)

    try {
      const provider = await createProvider(network)

      // Get transaction and receipt
      const [transaction, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash),
      ])

      if (!transaction) {
        setError("Транзакция не найдена")
        setLoading(false)
        return
      }

      setTxDetails({
        network: network.name,
        txHash,
        status: receipt?.status === 1 ? "Успешно" : "Ошибка",
        blockNumber: receipt?.blockNumber || 0,
        from: transaction.from,
        to: transaction.to || "Создание контракта",
        value: ethers.formatEther(transaction.value),
        gasUsed: receipt?.gasUsed.toString() || "0",
        explorerUrl: `${network.explorer}/tx/${txHash}`,
      })
    } catch (error) {
      console.error("Error getting transaction info:", error)
      setError(`Не удалось получить информацию о транзакции: ${error.message || "Ошибка сети"}`)
      toast({
        title: "Ошибка",
        description: "Не удалось получить информацию о транзакции. Пожалуйста, проверьте хэш и попробуйте снова.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="txHash">Хэш транзакции</Label>
        <Input id="txHash" placeholder="0x..." value={txHash} onChange={(e) => setTxHash(e.target.value)} />
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Button onClick={getTransactionInfo} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка...
          </>
        ) : (
          "Получить информацию"
        )}
      </Button>

      {txDetails && (
        <Card className="mt-4 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Сеть:</span>
                <span>{txDetails.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Статус:</span>
                <span className={txDetails.status === "Успешно" ? "text-green-500" : "text-red-500"}>
                  {txDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Номер блока:</span>
                <span>{txDetails.blockNumber}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">От:</span>
                <span className="text-sm break-all">{txDetails.from}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Кому:</span>
                <span className="text-sm break-all">{txDetails.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Сумма:</span>
                <span>{txDetails.value} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Использовано газа:</span>
                <span>{txDetails.gasUsed}</span>
              </div>
              <div className="pt-2">
                <a
                  href={txDetails.explorerUrl}
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
