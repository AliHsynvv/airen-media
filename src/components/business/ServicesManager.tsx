'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Package, TrendingDown } from 'lucide-react'
import type { BusinessService, BusinessServiceCategory } from '@/types/business'

const CATEGORIES: { value: BusinessServiceCategory; label: string }[] = [
  { value: 'rentecar', label: 'Rent a Car' },
  { value: 'turizm', label: 'Turizm (Tours)' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'restoran', label: 'Restoran' },
  { value: 'xestexana', label: 'Xəstəxana (Medical Tourism)' },
  { value: 'sigorta', label: 'Sığorta (Insurance)' },
  { value: 'aviacompany', label: 'Avia Company' },
  { value: 'attraction', label: 'Attraction' },
  { value: 'guides', label: 'Guides' },
]

type Props = {
  businessId: string
}

export default function ServicesManager({ businessId }: Props) {
  const [services, setServices] = useState<BusinessService[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<BusinessService | null>(null)

  useEffect(() => {
    loadServices()
  }, [businessId])

  const loadServices = async () => {
    try {
      const res = await fetch(`/api/business/services?business_id=${businessId}`)
      const json = await res.json()
      setServices(json.services || [])
    } catch (e) {
      console.error('Failed to load services:', e)
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (id: string) => {
    if (!confirm('Bu məhsulu/xidməti silmək istədiyinizdən əminsiniz?')) return
    
    try {
      const res = await fetch(`/api/business/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServices(services.filter(s => s.id !== id))
      }
    } catch (e) {
      alert('Silinmə xətası')
    }
  }

  const startEdit = (service: BusinessService) => {
    setEditingService(service)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingService(null)
  }

  const onServiceSaved = (service: BusinessService) => {
    if (editingService) {
      setServices(services.map(s => s.id === service.id ? service : s))
    } else {
      setServices([service, ...services])
    }
    cancelForm()
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Yüklənir...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Məhsullar & Xidmətlər
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            İşinizin məhsul və xidmətlərini idarə edin
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Yeni Əlavə Et
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <ServiceForm
          businessId={businessId}
          service={editingService}
          onSave={onServiceSaved}
          onCancel={cancelForm}
        />
      )}

      {/* List */}
      {services.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hələ məhsul yoxdur</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            İşinizin məhsul və xidmətlərini əlavə edərək müştərilərinizə göstərin
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            İlk Məhsulu Əlavə Et
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => startEdit(service)}
              onDelete={() => deleteService(service.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceCard({ service, onEdit, onDelete }: { service: BusinessService; onEdit: () => void; onDelete: () => void }) {
  const categoryLabel = CATEGORIES.find(c => c.value === service.category)?.label || service.category
  const hasDiscount = service.discount_percentage > 0
  const finalPrice = service.discounted_price || service.price

  return (
    <div className="group rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image */}
      {service.image_urls && service.image_urls.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={service.image_urls[0]} 
          alt={service.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Package className="h-16 w-16 text-gray-400" />
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-2">
          {categoryLabel}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{service.name}</h3>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through">{service.price} {service.currency}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                <TrendingDown className="h-3 w-3" />
                -{service.discount_percentage}%
              </span>
            </>
          )}
          <span className="text-xl font-bold text-gray-900">
            {finalPrice} {service.currency}
          </span>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 mb-4">
          {!service.is_available && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              Mövcud deyil
            </span>
          )}
          {service.is_bookable && (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              Bron edilə bilər
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Redaktə
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ServiceForm({ businessId, service, onSave, onCancel }: { 
  businessId: string
  service: BusinessService | null
  onSave: (service: BusinessService) => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'rentecar' as BusinessServiceCategory,
    price: service?.price || 0,
    currency: service?.currency || 'AZN',
    discount_percentage: service?.discount_percentage || 0,
    is_bookable: service?.is_bookable ?? true,
    is_available: service?.is_available ?? true,
    max_capacity: service?.max_capacity || null,
    min_booking_days: service?.min_booking_days || 1,
    category_data: service?.category_data || {},
  })

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const updateCategoryData = (key: string, value: any) => {
    setForm(prev => ({ 
      ...prev, 
      category_data: { ...prev.category_data, [key]: value }
    }))
  }

  const submit = async () => {
    if (!form.name || !form.category || form.price <= 0) {
      alert('Zəhmət olmasa bütün tələb olunan sahələri doldurun')
      return
    }

    setSaving(true)
    try {
      const payload = {
        business_id: businessId,
        ...form,
        max_capacity: form.max_capacity || null,
      }

      const url = service 
        ? `/api/business/services/${service.id}`
        : '/api/business/services'
      
      const res = await fetch(url, {
        method: service ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Yadda saxlama xətası')
      
      const json = await res.json()
      onSave(json.service)
    } catch (e: any) {
      alert(e.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {service ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul/Xidmət'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Fields */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Məhsul/xidmət adı"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Təsvir</label>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Qısa təsvir..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kateqoriya *</label>
          <select
            value={form.category}
            onChange={e => update('category', e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qiymət *</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={form.price}
              onChange={e => update('price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="flex-1 h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={form.currency}
              onChange={e => update('currency', e.target.value)}
              className="w-24 h-10 rounded-lg border border-gray-300 px-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="AZN">AZN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endirim %</label>
          <input
            type="number"
            value={form.discount_percentage}
            onChange={e => update('discount_percentage', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum tutum</label>
          <input
            type="number"
            value={form.max_capacity || ''}
            onChange={e => update('max_capacity', e.target.value ? parseInt(e.target.value) : null)}
            min="1"
            className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Məhdudiyyətsiz"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_bookable}
              onChange={e => update('is_bookable', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Bron edilə bilər</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={e => update('is_available', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Mövcuddur</span>
          </label>
        </div>

        {/* Category-specific fields will be rendered here based on category */}
        <div className="md:col-span-2">
          <CategorySpecificFields
            category={form.category}
            data={form.category_data}
            onChange={updateCategoryData}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Yadda saxlanır...' : 'Yadda saxla'}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
          Ləğv et
        </button>
      </div>
    </div>
  )
}

function CategorySpecificFields({ category, data, onChange }: {
  category: BusinessServiceCategory
  data: Record<string, any>
  onChange: (key: string, value: any) => void
}) {
  if (category === 'rentecar') {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-900">Avtomobil Məlumatları</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
            <input
              type="text"
              value={data.brand || ''}
              onChange={e => onChange('brand', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
              placeholder="Mercedes, BMW..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={data.model || ''}
              onChange={e => onChange('model', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
            <input
              type="number"
              value={data.year || new Date().getFullYear()}
              onChange={e => onChange('year', parseInt(e.target.value))}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oturacaq sayı</label>
            <input
              type="number"
              value={data.seats || 5}
              onChange={e => onChange('seats', parseInt(e.target.value))}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transmissiya</label>
            <select
              value={data.transmission || 'automatic'}
              onChange={e => onChange('transmission', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
            >
              <option value="automatic">Avtomatik</option>
              <option value="manual">Mexaniki</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yanacaq növü</label>
            <select
              value={data.fuel_type || 'petrol'}
              onChange={e => onChange('fuel_type', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
            >
              <option value="petrol">Benzin</option>
              <option value="diesel">Dizel</option>
              <option value="electric">Elektrik</option>
              <option value="hybrid">Hibrid</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  if (category === 'hotel' || category === 'apartment') {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-900">Otaq/Mənzil Məlumatları</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Otaq növü</label>
            <select
              value={data.room_type || 'single'}
              onChange={e => onChange('room_type', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
            >
              <option value="single">Tək nəfərlik</option>
              <option value="double">İki nəfərlik</option>
              <option value="suite">Suit</option>
              <option value="apartment">Mənzil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Çarpayı sayı</label>
            <input
              type="number"
              value={data.beds || 1}
              onChange={e => onChange('beds', parseInt(e.target.value))}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vanna otaqları</label>
            <input
              type="number"
              value={data.bathrooms || 1}
              onChange={e => onChange('bathrooms', parseInt(e.target.value))}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sahə (m²)</label>
            <input
              type="number"
              value={data.size_sqm || 30}
              onChange={e => onChange('size_sqm', parseInt(e.target.value))}
              className="w-full h-10 rounded-lg border border-gray-300 px-3"
              min="1"
            />
          </div>
        </div>
      </div>
    )
  }

  // Add more category-specific fields as needed
  return null
}

