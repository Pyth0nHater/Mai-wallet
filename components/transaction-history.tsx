"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNetwork } from "@/context/network-context"
import { useWallet } from "@/context/wallet-context"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Transaction = {
  hash: string
  timeStamp: string
  from: string
  to: string
  value: string
  status: string
  isFromCurrentAddress: boolean
  isToCurrentAddress: boolean
}

export default function TransactionHistory() {
  const { network } = useNetwork()
  const { activeWallet } = useWallet()
  const [address, setAddress] = useState(activeWallet?.address || "")
  const [transactions, setTransactions] = useState<Transaction[]>([])
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

  const fetchTransactions = async () => {
    if (!address) {
      setError("Адрес обязателен")
      return
    }

    if (!ethers.isAddress(address)) {
      setError("Невер��ый адрес")
      return
    }

    setError("")
    setLoading(true)
    setTransactions([])

    try {
      // Use the appropriate API key based on the network
      const apiKey =
        network.name.includes("arbitrum") && network.arbiscanApiKey ? network.arbiscanApiKey : network.etherscanApiKey

      const apiUrl = `${network.etherscanApi}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.status === "1" && Array.isArray(data.result)) {
        const txs = data.result.map((tx: any) => ({
          hash: tx.hash,
          timeStamp: tx.timeStamp,
          from: tx.from,
          to: tx.to || "Создание контракта",
          value: ethers.formatEther(tx.value),
          status: tx.isError === "0" ? "успешно" : "ошибка",
          isFromCurrentAddress: tx.from.toLowerCase() === address.toLowerCase(),
          isToCurrentAddress: tx.to?.toLowerCase() === address.toLowerCase(),
        }))
        setTransactions(txs)

        if (txs.length === 0) {
          setError("Транзакции не найдены")
          toast({
            title: "Нет транзакций",
            description: "Транзакции не найдены для этого адреса в этой сети.",
          })
        }
      } else if (data.status === "0") {
        // Handle API error but with the custom message
        setError("Транзакции не найдены")
        toast({
          title: "Нет транзакций",
          description: "Транзакции не найдены для этого адреса в этой сети.",
        })
      } else {
        setError("Транзакции не найдены")
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError(`Не удалось получить транзакции: ${error.message || "Ошибка сети"}`)
      toast({
        title: "Ошибка",
        description: "Не удалось получить историю транзакций. Пожалуйста, попробуйте снова.",
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

  // Auto-fetch transactions when address is set from wallet
  useEffect(() => {
    if (address && ethers.isAddress(address)) {
      fetchTransactions()
    }
  }, [address, network])

  const formatDate = (timestamp: string) => {
    return new Date(Number.parseInt(timestamp) * 1000).toLocaleString("ru-RU")
  }

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

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

      <Button onClick={fetchTransactions} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка...
          </>
        ) : (
          "Получить транзакции"
        )}
      </Button>

      {transactions.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <div className="rounded-md border border-blue-200">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="w-[80px]">Хэш</TableHead>
                  <TableHead className="hidden md:table-cell">Дата</TableHead>
                  <TableHead>Откуда/Куда</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead className="hidden md:table-cell">Статус</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.hash}>
                    <TableCell className="font-mono text-xs">{tx.hash.substring(0, 6)}...</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(tx.timeStamp)}</TableCell>
                    <TableCell>
                      {tx.isFromCurrentAddress ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-red-500">ИСХОДЯЩАЯ</span>
                          <span className="text-xs">Кому: {shortenAddress(tx.to)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs text-green-500">ВХОДЯЩАЯ</span>
                          <span className="text-xs">От: {shortenAddress(tx.from)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={tx.isFromCurrentAddress ? "text-red-500" : "text-green-500"}>
                      {tx.isFromCurrentAddress ? "-" : "+"}
                      {tx.value} ETH
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={tx.status === "успешно" ? "text-green-500" : "text-red-500"}>{tx.status}</span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`${network.explorer}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <a
              href={`${network.explorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center"
            >
              Посмотреть все транзакции на{" "}
              {network.name === "mainnet"
                ? "Etherscan"
                : network.name.includes("arbitrum")
                  ? "Arbiscan"
                  : network.name + ".etherscan.io"}
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
