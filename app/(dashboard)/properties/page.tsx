'use client'

import { useState, useEffect } from 'react'
import { Plus, Home, RefreshCw, Trash2, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    ical_url: '',
    checkout_time: '11:00',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function loadProperties() {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    setProperties(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setForm({ name: '', address: '', ical_url: '', checkout_time: '11:00', notes: '' })
    setEditingProperty(null)
    setShowForm(false)
    setError(null)
  }

  function startEdit(property: Property) {
    setEditingProperty(property)
    setForm({
      name: property.name,
      address: property.address ?? '',
      ical_url: property.ical_url ?? '',
      checkout_time: property.checkout_time ?? '11:00',
      notes: property.notes ?? '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Vous devez être connecté.')
      setSaving(false)
      return
    }

    if (editingProperty) {
      const { error } = await supabase
        .from('properties')
        .update({ ...form })
        .eq('id', editingProperty.id)
      if (error) setError(error.message)
    } else {
      const { error } = await supabase
        .from('properties')
        .insert({ ...form, owner_id: user.id })
      if (error) setError(error.message)
    }

    setSaving(false)
    if (!error) {
      resetForm()
      loadProperties()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce chalet? Cette action est irréversible.')) return
    await supabase.from('properties').delete().eq('id', id)
    loadProperties()
  }

  async function handleSync(propertyId: string) {
    await fetch('/api/ical/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
    loadProperties()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes chalets</h1>
          <p className="text-sm text-gray-500">
            Gérez vos propriétés et leurs calendriers iCal.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-mountain-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-mountain-500"
        >
          <Plus className="h-4 w-4" />
          Ajouter un chalet
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-xl border border-mountain-200 bg-mountain-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingProperty ? 'Modifier le chalet' : 'Nouveau chalet'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom du chalet *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Chalet des Sommets"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none focus:ring-1 focus:ring-mountain-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Rue du Mont, Mont-Tremblant"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none focus:ring-1 focus:ring-mountain-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Lien iCal (Airbnb / VRBO)
                </label>
                <input
                  type="url"
                  value={form.ical_url}
                  onChange={(e) => setForm({ ...form, ical_url: e.target.value })}
                  placeholder="https://www.airbnb.ca/calendar/ical/..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none focus:ring-1 focus:ring-mountain-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Heure de départ
                </label>
                <input
                  type="time"
                  value={form.checkout_time}
                  onChange={(e) => setForm({ ...form, checkout_time: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none focus:ring-1 focus:ring-mountain-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Instructions spéciales pour l'équipe de ménage..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mountain-400 focus:outline-none focus:ring-1 focus:ring-mountain-400"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-mountain-600 px-5 py-2 text-sm font-semibold text-white hover:bg-mountain-500 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : editingProperty ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Properties list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mountain-600 border-t-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Home className="mb-3 h-12 w-12 text-gray-300" />
          <h3 className="text-sm font-medium text-gray-900">
            Aucun chalet configuré
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez votre premier chalet pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  {property.address && (
                    <p className="text-xs text-gray-500">{property.address}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(property)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Départ:</span>
                  <span className="font-medium">{property.checkout_time ?? '11:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">iCal:</span>
                  <span className={property.ical_url ? 'text-green-600' : 'text-gray-400'}>
                    {property.ical_url ? 'Connecté' : 'Non configuré'}
                  </span>
                </div>
              </div>

              {property.ical_url && (
                <button
                  onClick={() => handleSync(property.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-mountain-200 py-2 text-xs font-medium text-mountain-700 hover:bg-mountain-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Synchroniser
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
