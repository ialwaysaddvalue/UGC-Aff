'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { formatRelativeTime, NICHE_OPTIONS, TONE_OPTIONS } from '@/lib/utils'
import { Script, AIProvider, ScriptGenerationResponse } from '@/types'
import {
  FileText, Sparkles, Plus, Copy, Trash2, Zap, ChevronRight,
  Clock, RefreshCw, CheckCircle2, Video, Edit3, Bot,
} from 'lucide-react'
import Link from 'next/link'

export default function ScriptsPage() {
  const { scripts, addScript, deleteScript, updateScript, settings } = useAppStore()
  const [generating, setGenerating] = useState(false)
  const [generatingHooks, setGeneratingHooks] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)

  // Form state
  const [niche, setNiche] = useState(settings.defaultNiche)
  const [offer, setOffer] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState<'casual' | 'energetic' | 'professional' | 'storytelling'>('casual')
  const [provider, setProvider] = useState<AIProvider>(settings.defaultAiProvider)
  const [hookCount, setHookCount] = useState(5)
  const [generated, setGenerated] = useState<ScriptGenerationResponse | null>(null)

  async function handleGenerate() {
    if (!niche || !offer) {
      toast('warning', 'Missing fields', 'Niche and offer are required')
      return
    }
    setGenerating(true)
    setGenerated(null)
    try {
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche, offer, targetAudience: audience, tone, provider, hookCount,
          apiKey: provider === 'claude' ? settings.anthropicApiKey : settings.openaiApiKey,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }
      const data: ScriptGenerationResponse = await res.json()
      setGenerated(data)
      toast('success', 'Script generated!', `${data.hookVariations.length} hook variations ready`)
    } catch (err) {
      toast('error', 'Generation failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRegenerateHooks() {
    if (!generated || !niche) return
    setGeneratingHooks(true)
    try {
      const res = await fetch('/api/scripts/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche, offer, existingHook: generated.hook, count: 10, provider,
          apiKey: provider === 'claude' ? settings.anthropicApiKey : settings.openaiApiKey,
        }),
      })
      const data = await res.json()
      setGenerated(prev => prev ? { ...prev, hookVariations: data.hooks } : prev)
      toast('success', `${data.hooks.length} new hooks generated`)
    } catch {
      toast('error', 'Hook generation failed')
    } finally {
      setGeneratingHooks(false)
    }
  }

  function saveScript() {
    if (!generated) return
    const script = addScript({
      title: `${niche} — ${offer.substring(0, 30)}`,
      niche,
      hook: generated.hook,
      body: generated.body,
      cta: generated.cta,
      fullScript: generated.fullScript,
      status: 'ready',
      aiProvider: provider,
      hookVariations: generated.hookVariations,
    })
    toast('success', 'Script saved!', script.title)
    setGenerated(null)
    setShowGenerator(false)
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    toast('success', 'Copied!')
  }

  return (
    <PageShell
      title="Scripts"
      subtitle="AI-powered UGC script generator"
      actions={
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setShowGenerator(true)}
        >
          New Script
        </Button>
      }
    >
      {/* Tips Banner */}
      <div className="p-4 bg-brand-600/5 border border-brand-600/20 rounded-2xl mb-6">
        <div className="flex items-start gap-3">
          <Zap className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-brand-300">Script Formula</p>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="text-slate-300 font-medium">Hook</span> (2s — curiosity or pain point) →{' '}
              <span className="text-slate-300 font-medium">Value</span> (what + why) →{' '}
              <span className="text-slate-300 font-medium">CTA</span> (Link in bio)
            </p>
          </div>
        </div>
      </div>

      {/* Scripts Grid */}
      {scripts.length === 0 ? (
        <div className="card-base text-center py-16">
          <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-brand-400" />
          </div>
          <p className="text-base font-semibold text-slate-200">No scripts yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Generate your first AI script. It takes 30 seconds.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            icon={<Sparkles className="h-4 w-4" />}
            onClick={() => setShowGenerator(true)}
          >
            Generate First Script
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scripts.map(script => (
            <ScriptCard
              key={script.id}
              script={script}
              onDelete={() => { deleteScript(script.id); toast('info', 'Script deleted') }}
              onSelect={() => setSelectedScript(script)}
              onCopy={() => copy(script.fullScript)}
              onStatusChange={(status) => updateScript(script.id, { status })}
            />
          ))}
        </div>
      )}

      {/* Script Generator Modal */}
      <Modal
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
        title="AI Script Generator"
        description="Fill in the details and let Claude or GPT-4 write your script"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Niche"
              value={niche}
              onChange={setNiche}
              placeholder="Select niche..."
              options={NICHE_OPTIONS.map(n => ({ value: n, label: n }))}
            />
            <Select
              label="Tone"
              value={tone}
              onChange={(v) => setTone(v as typeof tone)}
              options={TONE_OPTIONS}
            />
          </div>
          <Input
            label="Offer / Product"
            value={offer}
            onChange={e => setOffer(e.target.value)}
            placeholder="e.g. Glitchy affiliate platform — earn per click"
          />
          <Input
            label="Target Audience (optional)"
            value={audience}
            onChange={e => setAudience(e.target.value)}
            placeholder="e.g. People aged 18-35 who want to make money online"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="AI Provider"
              value={provider}
              onChange={(v) => setProvider(v as AIProvider)}
              options={[
                { value: 'claude', label: '✦ Claude (Recommended)' },
                { value: 'openai', label: '⊕ OpenAI GPT-4o' },
              ]}
            />
            <Select
              label="Hook Variations"
              value={hookCount.toString()}
              onChange={(v) => setHookCount(parseInt(v))}
              options={[
                { value: '3', label: '3 variations' },
                { value: '5', label: '5 variations' },
                { value: '10', label: '10 variations' },
              ]}
            />
          </div>

          {generated ? (
            <div className="mt-4 space-y-4">
              <div className="p-1 bg-bg-surface border border-emerald-500/20 rounded-xl">
                <Tabs defaultValue="full">
                  <div className="px-3 pt-3">
                    <TabsList>
                      <TabsTrigger value="full">Full Script</TabsTrigger>
                      <TabsTrigger value="hooks">Hooks ({generated.hookVariations?.length})</TabsTrigger>
                      <TabsTrigger value="parts">Parts</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="full" className="p-3">
                    <div className="relative group">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {generated.fullScript}
                      </pre>
                      <button
                        onClick={() => copy(generated.fullScript)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 bg-bg-card rounded-lg text-slate-400 hover:text-slate-100 transition-all"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-bg-border">
                      <Badge variant="brand">
                        <Clock className="h-3 w-3" /> ~{generated.estimatedDuration}s
                      </Badge>
                      <Badge variant="info">
                        <Bot className="h-3 w-3" /> {provider === 'claude' ? 'Claude' : 'GPT-4o'}
                      </Badge>
                    </div>
                  </TabsContent>

                  <TabsContent value="hooks" className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-400">A/B test these hooks to find your winner</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={generatingHooks}
                        onClick={handleRegenerateHooks}
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                      >
                        Regenerate
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {generated.hookVariations?.map((hook, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 bg-bg-surface rounded-lg group hover:bg-bg-hover transition-colors">
                          <span className="text-xs font-bold text-brand-500 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-slate-300 flex-1 leading-relaxed">&quot;{hook}&quot;</p>
                          <button onClick={() => copy(hook)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-100 transition-all">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="parts" className="p-3 space-y-3">
                    {[
                      { label: 'Hook', content: generated.hook, color: 'text-brand-300' },
                      { label: 'Body', content: generated.body, color: 'text-blue-300' },
                      { label: 'CTA', content: generated.cta, color: 'text-emerald-300' },
                    ].map(({ label, content, color }) => (
                      <div key={label}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${color} mb-1.5`}>{label}</p>
                        <div className="relative group p-3 bg-bg-surface rounded-lg">
                          <p className="text-sm text-slate-300 leading-relaxed">{content}</p>
                          <button onClick={() => copy(content)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-100 transition-all">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setGenerated(null)} className="flex-1">
                  Regenerate
                </Button>
                <Button variant="primary" onClick={saveScript} className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />}>
                  Save Script
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full mt-2"
              loading={generating}
              onClick={handleGenerate}
              icon={<Sparkles className="h-4 w-4" />}
            >
              {generating ? 'Generating...' : `Generate with ${provider === 'claude' ? 'Claude' : 'GPT-4o'}`}
            </Button>
          )}
        </div>
      </Modal>

      {/* View Script Modal */}
      {selectedScript && (
        <Modal
          open={!!selectedScript}
          onClose={() => setSelectedScript(null)}
          title={selectedScript.title}
          size="lg"
        >
          <Tabs defaultValue="full">
            <TabsList>
              <TabsTrigger value="full">Full Script</TabsTrigger>
              <TabsTrigger value="hooks">Hooks ({selectedScript.hookVariations?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="full">
              <div className="relative group p-4 bg-bg-surface rounded-xl">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedScript.fullScript}
                </pre>
                <button onClick={() => copy(selectedScript.fullScript)} className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 bg-bg-card rounded-lg text-slate-400 hover:text-slate-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" onClick={() => copy(selectedScript.fullScript)} icon={<Copy className="h-3.5 w-3.5" />}>
                  Copy
                </Button>
                <Link href="/videos" className="flex-1">
                  <Button variant="primary" className="w-full" icon={<Video className="h-3.5 w-3.5" />}>
                    Create Video
                  </Button>
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="hooks">
              <div className="space-y-2">
                {(selectedScript.hookVariations || []).map((hook, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-bg-surface rounded-lg group hover:bg-bg-hover">
                    <span className="text-xs font-bold text-brand-500 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-300 flex-1 leading-relaxed">&quot;{hook}&quot;</p>
                    <button onClick={() => copy(hook)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-100">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Modal>
      )}
    </PageShell>
  )
}

function ScriptCard({
  script,
  onDelete,
  onSelect,
  onCopy,
  onStatusChange,
}: {
  script: Script
  onDelete: () => void
  onSelect: () => void
  onCopy: () => void
  onStatusChange: (status: Script['status']) => void
}) {
  return (
    <Card hover className="cursor-pointer group" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-semibold text-slate-100 truncate">{script.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={script.aiProvider === 'claude' ? 'brand' : 'info'} className="text-[10px]">
              {script.aiProvider === 'claude' ? '✦ Claude' : '⊕ GPT-4o'}
            </Badge>
            <span className="text-[10px] text-slate-500">{formatRelativeTime(script.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={script.status === 'ready' ? 'success' : script.status === 'used' ? 'default' : 'warning'}>
            {script.status}
          </Badge>
        </div>
      </div>

      <div className="p-3 bg-bg-surface rounded-xl mb-3">
        <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Hook</p>
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">&quot;{script.hook}&quot;</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <span className="px-2 py-0.5 bg-bg-border rounded-md">{script.niche}</span>
        {script.hookVariations && (
          <span>{script.hookVariations.length} hook variations</span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-bg-border">
        <Button
          variant="ghost"
          size="sm"
          icon={<Copy className="h-3.5 w-3.5" />}
          onClick={(e) => { e.stopPropagation(); onCopy() }}
        >
          Copy
        </Button>
        <Link href="/videos" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Video className="h-3.5 w-3.5" />}
          >
            Make Video
          </Button>
        </Link>
        {script.status === 'ready' && (
          <Button
            variant="ghost"
            size="sm"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            onClick={(e) => { e.stopPropagation(); onStatusChange('used') }}
          >
            Mark Used
          </Button>
        )}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="h-3.5 w-3.5 text-red-400" />}
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          />
        </div>
      </div>
    </Card>
  )
}
