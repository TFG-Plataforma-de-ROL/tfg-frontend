import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'

export default function LayoutFull() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden h-full">
        <Outlet />
      </main>
    </div>
  )
}
