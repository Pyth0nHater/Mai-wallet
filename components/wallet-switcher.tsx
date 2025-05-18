"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Trash2, Edit, Wallet } from "lucide-react"

export default function WalletSwitcher() {
  const { wallets, activeWallet, setActiveWallet, updateWallet, removeWallet } = useWallet()
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [walletToRename, setWalletToRename] = useState<{ id: string; name: string } | null>(null)
  const [newWalletName, setNewWalletName] = useState("")

  const handleWalletSelect = (walletId: string) => {
    const selectedWallet = wallets.find((w) => w.id === walletId) || null
    if (selectedWallet) {
      setActiveWallet(selectedWallet)
    }
  }

  const handleRenameClick = (walletId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent dropdown from closing
    setWalletToRename({ id: walletId, name: currentName })
    setNewWalletName(currentName)
    setIsRenameDialogOpen(true)
  }

  const handleRenameSubmit = () => {
    if (walletToRename && newWalletName.trim()) {
      updateWallet(walletToRename.id, { name: newWalletName.trim() })
      setIsRenameDialogOpen(false)
      setWalletToRename(null)
      setNewWalletName("")
    }
  }

  const handleRemoveWallet = (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent dropdown from closing
    if (confirm("Вы уверены, что хотите удалить этот кошелек?")) {
      removeWallet(walletId)
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  if (!activeWallet) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between border-blue-300 bg-white">
            <div className="flex items-center">
              <Wallet className="mr-2 h-4 w-4 text-blue-600" />
              <span className="truncate max-w-[150px]">{activeWallet.name || formatAddress(activeWallet.address)}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
          <DropdownMenuLabel>Мои кошельки</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {wallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.id}
              className={`flex justify-between ${wallet.id === activeWallet.id ? "bg-blue-50" : ""}`}
              onClick={() => handleWalletSelect(wallet.id)}
            >
              <div className="truncate mr-2">
                <span className="font-medium">{wallet.name || formatAddress(wallet.address)}</span>
                <div className="text-xs text-muted-foreground">{formatAddress(wallet.address)}</div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={(e) => handleRenameClick(wallet.id, wallet.name, e)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={(e) => handleRemoveWallet(wallet.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать кошелек</DialogTitle>
            <DialogDescription>
              Введите новое имя для вашего кошелька, чтобы легче его идентифицировать.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Название кошелька</Label>
              <Input
                id="wallet-name"
                placeholder="Мой основной кошелек"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Адрес кошелька:{" "}
                {walletToRename ? formatAddress(wallets.find((w) => w.id === walletToRename.id)?.address || "") : ""}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRenameSubmit} className="bg-blue-500 hover:bg-blue-600">
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
