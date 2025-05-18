"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WalletGenerator from "@/components/wallet-generator"
import WalletFromMnemonic from "@/components/wallet-from-mnemonic"
import { useWallet } from "@/context/wallet-context"
import { Wallet, Import } from "lucide-react"

interface WalletOnboardingProps {
  onComplete: () => void
}

export default function WalletOnboarding({ onComplete }: WalletOnboardingProps) {
  const { wallets } = useWallet()
  const [activeTab, setActiveTab] = useState("create")

  const handleContinue = () => {
    if (wallets.length > 0) {
      onComplete()
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full">
        <Card className="w-full border-blue-200 shadow-md">
          <CardHeader className="text-center bg-blue-50">
            <CardTitle className="text-2xl text-blue-700">Добро пожаловать в MAI Кошелек</CardTitle>
            <CardDescription>Начните с создания или импорта кошелька</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 bg-blue-100">
                <TabsTrigger
                  value="create"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Wallet className="h-4 w-4" />
                  Создать новый
                </TabsTrigger>
                <TabsTrigger
                  value="import"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Import className="h-4 w-4" />
                  Импортировать
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Создайте новый кошелек со случайно сгенерированным адресом, приватным ключом и фразой
                    восстановления.
                  </p>
                  <WalletGenerator />
                </div>
              </TabsContent>

              <TabsContent value="import">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Импортируйте существующий кошелек, используя вашу мнемоническую фразу из 12 или 24 слов.
                  </p>
                  <WalletFromMnemonic />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleContinue}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={wallets.length === 0}
              size="lg"
            >
              Перейти к кошельку
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
