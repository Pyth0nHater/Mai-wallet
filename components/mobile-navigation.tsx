"use client"

import { Wallet, FileText, DollarSign, FileSearch, SendHorizontal, History } from "lucide-react"

interface MobileNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  availableTabs: string[]
}

export default function MobileNavigation({ activeTab, setActiveTab, availableTabs }: MobileNavigationProps) {
  const allTabs = [
    { id: "wallet", label: "Новый", icon: <Wallet className="h-5 w-5" /> },
    { id: "mnemonic", label: "Импорт", icon: <FileText className="h-5 w-5" /> },
    { id: "balance", label: "Баланс", icon: <DollarSign className="h-5 w-5" /> },
    { id: "transaction", label: "Транзакция", icon: <FileSearch className="h-5 w-5" /> },
    { id: "transfer", label: "Перевод", icon: <SendHorizontal className="h-5 w-5" /> },
    { id: "history", label: "История", icon: <History className="h-5 w-5" /> },
  ]

  // Filter tabs based on available tabs
  const tabs = allTabs.filter((tab) => availableTabs.includes(tab.id))

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 px-2 pb-2 pt-1">
      <div className={`grid grid-cols-${tabs.length} gap-1`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-md ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-600"
                : "text-muted-foreground hover:bg-blue-50 hover:text-blue-500"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
