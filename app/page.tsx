"use client"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WalletGenerator from "@/components/wallet-generator"
import WalletFromMnemonic from "@/components/wallet-from-mnemonic"
import WalletBalance from "@/components/wallet-balance"
import TransactionInfo from "@/components/transaction-info"
import TransferFunds from "@/components/transfer-funds"
import TransactionHistory from "@/components/transaction-history"
import NetworkSelector from "@/components/network-selector"
import { NetworkProvider } from "@/context/network-context"
import { WalletProvider } from "@/context/wallet-context"
import WalletOnboarding from "@/components/wallet-onboarding"
import MobileNavigation from "@/components/mobile-navigation"
import WalletHeader from "@/components/wallet-header"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("balance")
  const [isMobile, setIsMobile] = useState(false)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [showWalletTabs, setShowWalletTabs] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    const walletData = localStorage.getItem("walletData")
    if (walletData) {
      setIsOnboarded(true)
    }
  }, [])

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const handleOnboardingComplete = () => {
    setIsOnboarded(true)
  }

  const handleAddWalletClick = () => {
    setShowWalletTabs(true)
    setActiveTab("wallet")
  }

  const handleBackToMain = () => {
    setShowWalletTabs(false)
    setActiveTab("balance")
  }

  if (!isOnboarded) {
    return (
      <NetworkProvider>
        <WalletProvider>
          <WalletOnboarding onComplete={handleOnboardingComplete} />
        </WalletProvider>
      </NetworkProvider>
    )
  }

  // Define which tabs to show based on the current mode
  const availableTabs = showWalletTabs ? ["wallet", "mnemonic"] : ["balance", "transaction", "transfer", "history"]

  return (
    <NetworkProvider>
      <WalletProvider>
        <div className="container mx-auto py-4 px-4 max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-600">MAI Wallet</h1>

          <div className="mb-4">
            <NetworkSelector />
          </div>
          <WalletHeader />

          {!showWalletTabs ? (
            <div className="mb-4">
              <Button onClick={handleAddWalletClick} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Добавить новый кошелек
              </Button>
            </div>
          ) : (
            <div className="mb-4">
              <Button onClick={handleBackToMain} variant="outline" className="border-blue-300">
                <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к основному виду
              </Button>
            </div>
          )}

          {isMobile ? (
            <>
              <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} availableTabs={availableTabs} />

              <div className="mt-4 pb-20">
                {activeTab === "wallet" && showWalletTabs && (
                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-700">Создать новый кошелек</CardTitle>
                      <CardDescription>
                        Создайте новый кошелек с адресом, приватным ключом и мнемонической фразой
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WalletGenerator onWalletCreated={handleBackToMain} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "mnemonic" && showWalletTabs && (
                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-700">Восстановить из мнемонической фразы</CardTitle>
                      <CardDescription>Восстановите ваш кошелек, используя фразу из 12 или 24 слов</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WalletFromMnemonic onWalletImported={handleBackToMain} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "balance" && !showWalletTabs && (
                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-700">Проверить баланс</CardTitle>
                      <CardDescription>Просмотр баланса любого адреса</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WalletBalance />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "transaction" && !showWalletTabs && (
                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-700">Информация о транзакции</CardTitle>
                      <CardDescription>Получите детали о конкретной транзакции</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransactionInfo />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "transfer" && !showWalletTabs && (
                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-700">Перевод средств</CardTitle>
                      <CardDescription>Отправить ETH/ARB на другой адрес</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransferFunds />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "history" && !showWalletTabs && (
                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-700">История транзакций</CardTitle>
                      <CardDescription>Просмотр всех транзакций для адреса</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransactionHistory />
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <>
              {showWalletTabs ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 bg-blue-100">
                    <TabsTrigger
                      value="wallet"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Новый кошелек
                    </TabsTrigger>
                    <TabsTrigger
                      value="mnemonic"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Из мнемоники
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="wallet">
                    <Card className="border-blue-200 shadow-md">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">Создать новый кошелек</CardTitle>
                        <CardDescription>
                          Создайте новый кошелек с адресом, приватным ключом и мнемонической фразой
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WalletGenerator onWalletCreated={handleBackToMain} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="mnemonic">
                    <Card className="border-blue-200 shadow-md">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">Восстановить из мнемонической фразы</CardTitle>
                        <CardDescription>Восстановите ваш кошелек, используя фразу из 12 или 24 слов</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WalletFromMnemonic onWalletImported={handleBackToMain} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4 bg-blue-100">
                    <TabsTrigger
                      value="balance"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Баланс
                    </TabsTrigger>
                    <TabsTrigger
                      value="transaction"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Транзакция
                    </TabsTrigger>
                    <TabsTrigger
                      value="transfer"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Перевод
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      История
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="balance">
                    <Card className="border-blue-200 shadow-md">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">Проверить баланс</CardTitle>
                        <CardDescription>Просмотр баланса любого адреса</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WalletBalance />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transaction">
                    <Card className="border-blue-200 shadow-md">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">Информация о транзакции</CardTitle>
                        <CardDescription>Получите детали о конкретной транзакции</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TransactionInfo />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transfer">
                    <Card className="border-blue-200 shadow-md">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">Перевод средств</CardTitle>
                        <CardDescription>Отправить ETH/ARB на другой адрес</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TransferFunds />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history">
                    <Card className="border-blue-200 shadow-md">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">История транзакций</CardTitle>
                        <CardDescription>Просмотр всех транзакций для адреса</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TransactionHistory />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </WalletProvider>
    </NetworkProvider>
  )
}
