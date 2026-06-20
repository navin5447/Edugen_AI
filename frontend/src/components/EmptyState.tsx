import { BookOpen, Upload, Sparkles } from 'lucide-react'
import { Card } from './ui'

export function EmptyState({ title, description, icon = 'sparkles' }: { title: string; description: string; icon?: 'sparkles' | 'upload' | 'book' }) {
  const Icon = icon === 'upload' ? Upload : icon === 'book' ? BookOpen : Sparkles

  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </Card>
  )
}
