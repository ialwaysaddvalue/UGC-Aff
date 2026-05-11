'use client'
import { cn } from '@/lib/utils'
import { createContext, useContext, useState } from 'react'

interface TabsContextValue {
  active: string
  setActive: (val: string) => void
}

const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => {} })

interface TabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, children, className, onValueChange }: TabsProps) {
  const [active, setActiveState] = useState(defaultValue)
  const setActive = (val: string) => {
    setActiveState(val)
    onValueChange?.(val)
  }
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-1 p-1 bg-bg-surface border border-bg-border rounded-xl', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setActive } = useContext(TabsContext)
  const isActive = active === value
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-bg-hover',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return <div className={cn('mt-4', className)}>{children}</div>
}
