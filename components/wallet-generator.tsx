"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@/context/wallet-context"
import { Clipboard, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WalletGeneratorProps {
  onWalletCreated?: () => void
}

export default function WalletGenerator({ onWalletCreated }: WalletGeneratorProps) {
  const { addWallet } = useWallet()
  const [generatedWallet, setGeneratedWallet] = useState<{
    address: string
    privateKey: string
    mnemonic: string
  } | null>(null)
  const [walletName, setWalletName] = useState("")
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const { toast } = useToast()

  const generateWallet = () => {
    try {
      const wallet = ethers.Wallet.createRandom()
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase || "",
      }
      setGeneratedWallet(walletData)
      setWalletName(`MAI Кошелек ${new Date().toLocaleDateString("ru-RU")}`)
    } catch (error) {
      console.error("Error generating wallet:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать кошелек",
        variant: "destructive",
      })
    }
  }

  const saveWallet = () => {
    if (generatedWallet) {
      const name = walletName.trim() || `MAI Кошелек ${new Date().toLocaleDateString("ru-RU")}`
      addWallet({
        name,
        address: generatedWallet.address,
        privateKey: generatedWallet.privateKey,
        mnemonic: generatedWallet.mnemonic,
      })

      toast({
        title: "Кошелек сохранен",
        description: "Ваш новый кошелек сохранен и теперь активен",
      })

      // Reset the form
      setGeneratedWallet(null)
      setWalletName("")

      // Call the callback if provided
      if (onWalletCreated) {
        onWalletCreated()
      }
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Скопировано!",
      description: `${label} скопирован в буфер обмена`,
    })
  }

  return (
    <div>
      <Button
        id="generate-wallet-btn"
        onClick={generateWallet}
        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Сгенерировать новый кошелек
      </Button>

      {generatedWallet && (
        <>
          <div className="mb-4">
            <Label htmlFor="wallet-name">Название кошелька (опционально)</Label>
            <Input
              id="wallet-name"
              placeholder="Мой MAI кошелек"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="mt-1 border-blue-300"
            />
          </div>

          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-700">Адрес:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedWallet.address, "Адрес")}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 bg-white rounded-md break-all border border-blue-200">
                  {generatedWallet.address}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-700">Приватный ключ:</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedWallet.privateKey, "Приватный ключ")}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-md break-all border border-blue-200">
                  {showPrivateKey
                    ? generatedWallet.privateKey
                    : "••••••••••••••••••••••••••••"}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-700">Мнемоническая фраза:</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedWallet.mnemonic, "Мнемоническая фраза")}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-md break-all border border-blue-200">
                  {showMnemonic
                    ? generatedWallet.mnemonic
                    : "•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••"}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-red-500">
                  ⚠️ Никогда не делитесь своим приватным ключом или мнемонической фразой! Любой, кто имеет к ним доступ,
                  может украсть ваши средства.
                </p>
              </div>

              <Button onClick={saveWallet} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Сохранить кошелек
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
