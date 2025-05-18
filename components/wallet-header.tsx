"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WalletSwitcher from "@/components/wallet-switcher"

export default function WalletHeader() {
  const { activeWallet, clearWallets } = useWallet()
  const { toast } = useToast()

  const handleLogout = () => {
    if (confirm("Вы уверены, что хотите выйти? Это удалит все данные кошельков с этого устройства.")) {
      clearWallets()
      toast({
        title: "Выход выполнен",
        description: "Все данные кошельков удалены с этого устройства",
      })
    }
  }

  if (!activeWallet) return null

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="w-full md:w-auto">
        <WalletSwitcher />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full md:w-auto text-blue-600 hover:bg-blue-100 hover:text-blue-700"
      >
        <LogOut className="h-4 w-4 mr-1" />
        <span>Выйти</span>
      </Button>
    </div>
  )
}
