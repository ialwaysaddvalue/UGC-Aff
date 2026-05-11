'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { NICHE_OPTIONS, PLATFORM_CONFIG } from '@/lib/utils'
import { Platform } from '@/types'
import {
  Settings, Key, Zap, Globe, Eye, EyeOff, CheckCircle2,
  ExternalLink, AlertCircle, Bot, Video, Target,
} from 'lucide-react'

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook', 'snapchat'] as Platform[]

function APIKeyInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  docsUrl,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  hint?: string
  docsUrl?: string
}) {
  const [show, setShow] = useState(false)
  const hasKey = value.length > 10

  return (
    <div className="p-4 bg-bg-surface border border-bg-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-200">{label}</label>
        <div className="flex items-center gap-2">
          {hasKey && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>}
          {!hasKey && <Badge variant="warning"><AlertCircle className="h-3 w-3" /> Not configured</Badge>}
          {docsUrl && (
            <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-base pr-10"
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const [local, setLocal] = useState({ ...settings })

  function update(key: keyof typeof settings, value: string | string[] | number) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  function save() {
    updateSettings(local)
    toast('success', 'Settings saved!', 'Your API keys and preferences have been updated')
  }

  function togglePlatform(p: Platform) {
    const current = local.defaultPlatforms
    const updated = current.includes(p)
      ? current.filter(x => x !== p)
      : [...current, p]
    update('defaultPlatforms', updated)
  }

  const integrationStatus = [
    {
      name: 'OpenAI',
      status: local.openaiApiKey.length > 10 ? 'connected' : 'missing',
      icon: Bot,
      color: 'text-emerald-400',
      desc: 'Script generation, captions, hook variations',
    },
    {
      name: 'Claude (Anthropic)',
      status: local.anthropicApiKey.length > 10 ? 'connected' : 'missing',
      icon: Bot,
      color: 'text-amber-400',
      desc: 'Advanced script writing, trend analysis',
    },
    {
      name: 'HeyGen',
      status: local.heygenApiKey.length > 10 ? 'connected' : 'missing',
      icon: Video,
      color: 'text-violet-400',
      desc: 'AI avatar UGC video generation',
    },
    {
      name: 'Higgsfield AI',
      status: local.higgsfieldApiKey.length > 10 ? 'connected' : 'missing',
      icon: Video,
      color: 'text-blue-400',
      desc: 'Cinematic AI video generation',
    },
    {
      name: 'Glitchy',
      status: local.glitchyApiKey.length > 10 ? 'connected' : 'optional',
      icon: Target,
      color: 'text-brand-400',
      desc: 'Affiliate campaign management',
    },
  ]

  return (
    <PageShell
      title="Settings"
      subtitle="Configure your AI integrations and preferences"
    >
      <Tabs defaultValue="api">
        <TabsList className="mb-6">
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="status">Integration Status</TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <div className="space-y-6">
            {/* AI Models */}
            <div className="card-base">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-100">AI Models</h3>
                <Badge variant="brand">Script Generation</Badge>
              </div>
              <div className="space-y-3">
                <APIKeyInput
                  label="Anthropic (Claude Pro)"
                  value={local.anthropicApiKey}
                  onChange={v => update('anthropicApiKey', v)}
                  placeholder="sk-ant-api03-..."
                  hint="Used for script generation, hook variations, and trend analysis. Claude is the recommended AI for scripts."
                  docsUrl="https://console.anthropic.com/settings/keys"
                />
                <APIKeyInput
                  label="OpenAI (GPT-4o)"
                  value={local.openaiApiKey}
                  onChange={v => update('openaiApiKey', v)}
                  placeholder="sk-proj-..."
                  hint="Used for script generation, caption writing, and hashtag optimization."
                  docsUrl="https://platform.openai.com/api-keys"
                />
              </div>
            </div>

            {/* Video Creation */}
            <div className="card-base">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-slate-100">Video Creation</h3>
                <Badge variant="brand">AI Video Generation</Badge>
              </div>
              <div className="space-y-3">
                <APIKeyInput
                  label="HeyGen API Key"
                  value={local.heygenApiKey}
                  onChange={v => update('heygenApiKey', v)}
                  placeholder="Your HeyGen API key..."
                  hint="Access 100+ AI avatars for UGC-style talking head videos. Perfect for authentic creator content."
                  docsUrl="https://app.heygen.com/settings/api"
                />
                <APIKeyInput
                  label="Higgsfield AI API Key"
                  value={local.higgsfieldApiKey}
                  onChange={v => update('higgsfieldApiKey', v)}
                  placeholder="Your Higgsfield API key..."
                  hint="Generate cinematic B-roll footage and AI videos from text prompts."
                  docsUrl="https://app.higgsfield.ai/settings"
                />
              </div>
            </div>

            {/* Glitchy */}
            <div className="card-base">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-100">Glitchy Affiliate Platform</h3>
                <Badge variant="success">Monetization</Badge>
              </div>
              <div className="space-y-3">
                <APIKeyInput
                  label="Glitchy API Key (Optional)"
                  value={local.glitchyApiKey}
                  onChange={v => update('glitchyApiKey', v)}
                  placeholder="Your Glitchy API key..."
                  hint="Optional: Enables automatic campaign sync. You can also manage campaigns manually."
                  docsUrl="https://glitchy.com/dashboard/settings"
                />
                <Input
                  label="Glitchy Publisher ID"
                  value={local.glitchyPublisherId}
                  onChange={e => update('glitchyPublisherId', e.target.value)}
                  placeholder="Your publisher ID..."
                  hint="Find this in your Glitchy dashboard under Account Settings"
                />
              </div>
            </div>

            <Button variant="primary" onClick={save} icon={<CheckCircle2 className="h-4 w-4" />}>
              Save API Keys
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="space-y-6">
            <div className="card-base">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-100">Default Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Default AI Provider"
                    value={local.defaultAiProvider}
                    onChange={v => update('defaultAiProvider', v)}
                    options={[
                      { value: 'claude', label: 'Claude (Recommended)' },
                      { value: 'openai', label: 'OpenAI GPT-4o' },
                    ]}
                  />
                  <Select
                    label="Default Video Provider"
                    value={local.defaultVideoProvider}
                    onChange={v => update('defaultVideoProvider', v)}
                    options={[
                      { value: 'heygen', label: 'HeyGen (Avatars)' },
                      { value: 'higgsfield', label: 'Higgsfield (Cinematic)' },
                    ]}
                  />
                </div>
                <Select
                  label="Default Niche"
                  value={local.defaultNiche}
                  onChange={v => update('defaultNiche', v)}
                  placeholder="Select your primary niche..."
                  options={NICHE_OPTIONS.map(n => ({ value: n, label: n }))}
                />
                <Select
                  label="Daily Posts Target"
                  value={local.postsPerDay.toString()}
                  onChange={v => update('postsPerDay', parseInt(v))}
                  options={[
                    { value: '1', label: '1 post/day' },
                    { value: '3', label: '3 posts/day (Recommended)' },
                    { value: '5', label: '5 posts/day' },
                    { value: '10', label: '10 posts/day' },
                  ]}
                />
              </div>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100">Default Platforms</h3>
                <p className="text-xs text-slate-500">Applied when publishing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const cfg = PLATFORM_CONFIG[p]
                  const active = local.defaultPlatforms.includes(p)
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                        active
                          ? `${cfg.bgColor} ${cfg.color} border-current/30`
                          : 'border-bg-border text-slate-500 hover:border-bg-hover'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button variant="primary" onClick={save} icon={<CheckCircle2 className="h-4 w-4" />}>
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="status">
          <div className="space-y-3">
            {integrationStatus.map(({ name, status, icon: Icon, color, desc }) => (
              <div key={name} className="p-4 bg-bg-card border border-bg-border rounded-xl flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${status === 'connected' ? 'bg-emerald-500/10' : status === 'optional' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                  <Icon className={`h-5 w-5 ${status === 'connected' ? 'text-emerald-400' : status === 'optional' ? 'text-amber-400' : 'text-red-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-100">{name}</p>
                    <Badge variant={status === 'connected' ? 'success' : status === 'optional' ? 'warning' : 'danger'}>
                      {status === 'connected' ? 'Connected' : status === 'optional' ? 'Optional' : 'Not configured'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                {status !== 'connected' && (
                  <Button variant="ghost" size="sm" icon={<Key className="h-3.5 w-3.5" />}>
                    Add Key
                  </Button>
                )}
              </div>
            ))}

            <div className="mt-4 p-4 bg-brand-600/5 border border-brand-600/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-brand-300">All keys are stored locally</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your API keys are stored in your browser&apos;s local storage only. They are never sent to any third-party server — only directly to each provider&apos;s API when you take action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
