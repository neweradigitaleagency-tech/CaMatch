interface Tab {
  id: string
  label: string
  count?: number
  badge?: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative px-4 py-2.5 text-[13px] font-medium whitespace-nowrap cursor-pointer transition-colors
            ${activeTab === tab.id
              ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900"
              : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
            {tab.badge && (
              <span className="text-[11px] text-white bg-red-500 px-1.5 py-0.5 rounded-full">{tab.badge}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
