"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@/context/wallet-context"
import { Clipboard, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface WalletFromMnemonicProps {
  onWalletImported?: () => void
}

export default function WalletFromMnemonic({ onWalletImported }: WalletFromMnemonicProps) {
  const { addWallet } = useWallet()
  const [mnemonic, setMnemonic] = useState("")
  const [walletName, setWalletName] = useState("")
  const [recoveredWallet, setRecoveredWallet] = useState<{
    address: string
    privateKey: string
    publicKey: string
  } | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const recoverWallet = () => {
    try {
      setError("")

      // Basic validation
      const words = mnemonic.trim().split(/\s+/)
      if (words.length !== 12 && words.length !== 24) {
        setError("Неверная мнемоническая фраза (должно быть 12 или 24 слова)")
        return
      }

      // Create wallet from mnemonic
      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic.trim())
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
      }

      setRecoveredWallet(walletData)
      setWalletName(`Импортированный MAI ${new Date().toLocaleDateString("ru-RU")}`)
    } catch (error) {
      console.error("Error recovering wallet:", error)
      setError("Не удалось восстановить кошелек. Пожалуйста, проверьте мнемоническую фразу.")
    }
  }

  const saveWallet = () => {
    if (recoveredWallet) {
      const name = walletName.trim() || `Импортированный MAI ${new Date().toLocaleDateString("ru-RU")}`
      addWallet({
        name,
        address: recoveredWallet.address,
        privateKey: recoveredWallet.privateKey,
        mnemonic: mnemonic.trim(),
      })

      toast({
        title: "Кошелек импортирован",
        description: "Ваш кошелек импортирован и теперь активен",
      })

      // Reset the form
      setRecoveredWallet(null)
      setMnemonic("")
      setWalletName("")

      // Call the callback if provided
      if (onWalletImported) {
        onWalletImported()
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mnemonic" className="text-blue-700">
            Введите вашу мнемоническую фразу из 12 или 24 слов
          </Label>
          <Textarea
            id="mnemonic"
            placeholder="Введите мнемоническую фразу (12 или 24 слова, разделенные пробелами)"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            rows={3}
            className="border-blue-300"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <Button onClick={recoverWallet} className="bg-blue-500 hover:bg-blue-600 text-white">
          Восстановить кошелек
        </Button>

        {recoveredWallet && (
          <>
            <div className="mt-4">
              <Label htmlFor="import-wallet-name" className="text-blue-700">
                Название кошелька (опционально)
              </Label>
              <Input
                id="import-wallet-name"
                placeholder="Мой импортированный MAI кошелек"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="mt-1 border-blue-300"
              />
            </div>

            <Card className="border-2 border-blue-200 bg-blue-50 mt-4">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-blue-700">Адрес:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(recoveredWallet.address, "Адрес")}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2 bg-white rounded-md break-all border border-blue-200">
                    {recoveredWallet.address}
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
                        onClick={() => copyToClipboard(recoveredWallet.privateKey, "Приватный ключ")}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-md break-all border border-blue-200">
                    {showPrivateKey
                      ? recoveredWallet.privateKey
                      : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-red-500">
                    ⚠️ Никогда не делитесь своим приватным ключом! Любой, кто имеет к нему доступ, может украсть ваши
                    средства.
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
    </div>
  )
}
