'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Pencil, Trash2, Phone, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { TeamMember, Property } from '@/types'

const roleLabels: Record<string, string> = {
  cleaning: 'Ménage',
  maintenance: 'Maintenance',
  checkin: 'Check-in',
}

const channelLabels: Record<string, string> = {
  sms: 'SMS',
  messenger: 'Messenger',
  whatsapp: 'WhatsApp',
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    messenger_id: '',
    role: 'cleaning',
    preferred_channel: 'sms',
    property_id: '',
    active: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const [{ data: props }, { data: mems }] = await Promise.all([
      supabase.from('properties').select('id, name').order('name'),
      supabase.from('team_members').select('*').order('name'),
    ])
    setProperties(props ?? [])
    setMembers(mems ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setForm({ name: '', phone: '', messenger_id: '', role: 'cleaning', preferred_channel: 'sms', property_id: properties[0]?.id ?? '', active: true })
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  function startEdit(member: TeamMember) {
    setEditing(member)
    setForm({
      name: member.name,
      phone: member.phone ?? '',
      messenger_id: member.messenger_id ?? '',
      role: member.role,
      preferred_channel: member.preferred_channel,
      property_id: member.property_id,
      active: member.active,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!form.property_id) {
      setError('Veuillez sélectionner un chalet.')
      setSaving(false)
      return
    }

    if (editing) {
      const { error } = await supabase
        .from('team_members')
        .update({ ...form })
        .eq('id', editing.id)
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.from('team_members').insert({ ...form })
      if (error) setError(error.message)
    }

    setSaving(false)
    if (!error) {
      resetForm()
      load()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce membre? Cette action est irréversible.')) return
    await supabase.from('team_members').delete().eq('id', id)
    load()
  }

  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p]))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon équipe</h1>
          <p className="text-sm text-gray-500">
            Gérez les contacts de votre équipe de ménage et de maintenance.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-mountain-600 px-4 py-2 text-sm font-semibold text-white hover:bg-mountain-500"
        >
          <Plus className="h-4 w-4" />
          Ajouter un membre
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-mountain-200 bg-mountain-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editing ? 'Modifier le membre' : 'Nouveau membre'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Marie Beausoleil"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 819 555-0000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Chalet *</label>
                <select
                  value={form.property_id}
                  onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none"
                >
                  <option value="">Sélectionner un chalet...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none"
                >
                  <option value="cleaning">Ménage</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="checkin">Check-in</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Canal préféré
                </label>
                <select
                  value={form.preferred_channel}
                  onChange={(e) => setForm({ ...form, preferred_channel: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none"
                >
                  <option value="sms">SMS</option>
                  <option value="messenger">Messenger</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  ID Messenger (optionnel)
                </label>
                <input
                  type="text"
                  value={form.messenger_id}
                  onChange={(e) => setForm({ ...form, messenger_id: e.target.value })}
                  placeholder="ID Facebook Messenger"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-mountain-600 px-5 py-2 text-sm font-semibold text-white hover:bg-mountain-500 disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mountain-600 border-t-transparent" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Users className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">Aucun membre d&apos;équipe</p>
          <p className="mt-1 text-sm text-gray-500">Ajoutez votre équipe de ménage pour activer les alertes automatiques.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mountain-100 text-sm font-bold text-mountain-700">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {propertyMap[member.property_id]?.name ?? 'Chalet inconnu'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(member)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="rounded-full bg-snow-100 px-2 py-0.5 text-xs">
                    {roleLabels[member.role] ?? member.role}
                  </span>
                  <span className="rounded-full bg-mountain-100 px-2 py-0.5 text-xs text-mountain-700">
                    {channelLabels[member.preferred_channel] ?? member.preferred_channel}
                  </span>
                  {!member.active && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">Inactif</span>
                  )}
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="h-3 w-3" />
                    {member.phone}
                  </div>
                )}
                {member.messenger_id && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MessageSquare className="h-3 w-3" />
                    Messenger configuré
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
