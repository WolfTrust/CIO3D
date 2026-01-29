"use client"

import { useState, useEffect, useRef } from "react"
import { useMembersStore, type Member, type Relationship, type RelationshipType } from "@/lib/members-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, X, Save, Users, Mail, Phone, Building2, MapPin, Download, Link2, Network } from "lucide-react"
import { searchCities, findCityByName, type CityData } from "@/lib/city-coordinates"
import { generateDummyMembers, generateDummyRelationships } from "@/lib/members-dummy-data"

export function Members() {
  const members = useMembersStore((state) => state.members)
  const addMember = useMembersStore((state) => state.addMember)
  const updateMember = useMembersStore((state) => state.updateMember)
  const deleteMember = useMembersStore((state) => state.deleteMember)
  const addRelationship = useMembersStore((state) => state.addRelationship)
  const updateRelationship = useMembersStore((state) => state.updateRelationship)
  const deleteRelationship = useMembersStore((state) => state.deleteRelationship)
  const getRelationshipsForMember = useMembersStore((state) => state.getRelationshipsForMember)
  const relationships = useMembersStore((state) => state.relationships)
  
  const [selectedMemberForRelationships, setSelectedMemberForRelationships] = useState<string | null>(null)
  const [showRelationshipForm, setShowRelationshipForm] = useState(false)
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null)
  const [relationshipFormData, setRelationshipFormData] = useState<{
    toMemberId: string
    type: RelationshipType
    description: string
  }>({
    toMemberId: "",
    type: "other",
    description: "",
  })

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<CityData[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const citySuggestionsRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Member>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    street: "",
    zipCode: "",
    city: "",
    country: "",
    coordinates: undefined,
    notes: "",
  })

  // Stadt-Autocomplete
  useEffect(() => {
    if (formData.city && formData.city.length >= 2) {
      const results = searchCities(formData.city)
      setCitySuggestions(results)
      setShowCitySuggestions(results.length > 0)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }, [formData.city])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  const handleLoadDummyData = () => {
    console.log("Lade Dummy-Daten...", members.length)
    
    try {
      // Wenn bereits 100+ Mitglieder vorhanden sind, frage ob neu geladen werden soll
      if (members.length >= 100) {
        const confirmReload = confirm(
          "Es sind bereits 100 oder mehr Mitglieder vorhanden. Möchten Sie die Dummy-Daten trotzdem neu laden?\n\n" +
          "Hinweis: Dies fügt weitere Mitglieder hinzu, wenn noch nicht alle 100 vorhanden sind."
        )
        if (!confirmReload) {
          return
        }
      }
      
      const dummyMembers = generateDummyMembers()
      console.log("Generierte Dummy-Mitglieder:", dummyMembers.length)
      
      const existingIds = new Set(members.map(m => m.id))
      
      // Filtere bereits vorhandene Mitglieder heraus
      const newMembers = dummyMembers.filter(m => !existingIds.has(m.id))
      
      console.log("Neue Mitglieder zum Hinzufügen:", newMembers.length)
      
      if (newMembers.length === 0) {
        alert("Alle 100 Dummy-Mitglieder sind bereits vorhanden!")
        return
      }
      
      // Füge neue Mitglieder hinzu
      console.log("Füge", newMembers.length, "Mitglieder hinzu...")
      newMembers.forEach((member, index) => {
        // Entferne id, createdAt, updatedAt - der Store generiert diese neu
        const { id, createdAt, updatedAt, ...memberData } = member
        // Stelle sicher, dass country im richtigen Format ist
        const memberToAdd = {
          ...memberData,
          country: member.country?.toUpperCase() || member.country,
        }
        addMember(memberToAdd)
        
        if ((index + 1) % 10 === 0) {
          console.log(`Hinzugefügt: ${index + 1}/${newMembers.length}`)
        }
      })
      
      // Erstelle Beziehungen für alle Mitglieder (alte + neue)
      const allMemberIds = [...members.map(m => m.id), ...newMembers.map(m => m.id)]
      const dummyRelationships = generateDummyRelationships(allMemberIds)
      
      // Füge neue Beziehungen hinzu (nur wenn noch nicht vorhanden)
      const existingRelIds = new Set(relationships.map(r => r.id))
      const newRelationships = dummyRelationships.filter(r => !existingRelIds.has(r.id))
      
      newRelationships.forEach(rel => {
        addRelationship(rel)
      })
      
      console.log("Dummy-Daten geladen:", newMembers.length, "Mitglieder,", newRelationships.length, "neue Beziehungen")
      alert(`${newMembers.length} neue Dummy-Mitglieder mit ${newRelationships.length} Beziehungen wurden geladen!`)
    } catch (error) {
      console.error("Fehler beim Laden der Dummy-Daten:", error)
      alert("Fehler beim Laden der Dummy-Daten. Bitte Konsole prüfen.")
    }
  }

  const selectCity = (city: CityData) => {
    setFormData({
      ...formData,
      city: city.name,
      country: city.country.toUpperCase(),
      coordinates: city.coordinates,
    })
    setShowCitySuggestions(false)
  }

  const handleOpenForm = (member?: Member) => {
    if (member) {
      setEditingId(member.id)
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || "",
        phone: member.phone || "",
        company: member.company || "",
        position: member.position || "",
        street: member.street || "",
        zipCode: member.zipCode || "",
        city: member.city || "",
        country: member.country || "",
        coordinates: member.coordinates,
        notes: member.notes || "",
      })
    } else {
      setEditingId(null)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        street: "",
        zipCode: "",
        city: "",
        country: "",
        coordinates: undefined,
        notes: "",
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      street: "",
      zipCode: "",
        city: "",
        country: "",
        coordinates: undefined,
        notes: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName) {
      return
    }

    if (editingId) {
      updateMember(editingId, formData)
    } else {
      addMember({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        street: formData.street,
        zipCode: formData.zipCode,
        city: formData.city,
        country: formData.country,
        coordinates: formData.coordinates,
        notes: formData.notes,
      })
    }

    handleCloseForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Möchten Sie dieses Mitglied wirklich löschen?")) {
      deleteMember(id)
    }
  }

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      member.firstName.toLowerCase().includes(query) ||
      member.lastName.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.company?.toLowerCase().includes(query) ||
      member.city?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Mitglieder</h2>
            <span className="text-sm text-muted-foreground">({members.length})</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <Button
              onClick={() => {
                console.log("Button geklickt, aktuelle Mitglieder:", members.length)
                handleLoadDummyData()
              }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span className="whitespace-nowrap">
                {members.length === 0 
                  ? "100 Dummy-Mitglieder laden" 
                  : members.length >= 100 
                    ? "Dummy-Daten neu laden" 
                    : `${100 - members.length} weitere laden`}
              </span>
            </Button>
            <Button onClick={() => handleOpenForm()} size="sm" className="flex-1 sm:flex-initial">
              <Plus className="w-4 h-4 mr-1" />
              Neu
            </Button>
          </div>
        </div>

        <div className="relative">
          <Input
            type="text"
            placeholder="Mitglieder suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Keine Mitglieder gefunden" : "Noch keine Mitglieder vorhanden"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenForm()} className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Erstes Mitglied hinzufügen
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {member.firstName} {member.lastName}
                      </h3>
                      {getRelationshipsForMember(member.id).length > 0 && (
                        <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full">
                          {getRelationshipsForMember(member.id).length} Beziehung{getRelationshipsForMember(member.id).length !== 1 ? 'en' : ''}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      {member.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span>{member.company}</span>
                          {member.position && <span> - {member.position}</span>}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 shrink-0" />
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 shrink-0" />
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {member.phone}
                          </a>
                        </div>
                      )}
                      {(member.street || member.city || member.zipCode) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>
                            {[member.street, member.zipCode, member.city, member.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      {member.notes && (
                        <p className="mt-2 text-xs italic line-clamp-2">{member.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        setSelectedMemberForRelationships(member.id)
                        setShowRelationshipForm(false)
                        setEditingRelationshipId(null)
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md"
                    >
                      <Network className="w-4 h-4 mr-1.5" />
                      Beziehungen verwalten
                      {getRelationshipsForMember(member.id).length > 0 && (
                        <span className="ml-2 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {getRelationshipsForMember(member.id).length}
                        </span>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleOpenForm(member)}
                      size="icon-sm"
                      variant="ghost"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(member.id)}
                      size="icon-sm"
                      variant="ghost"
                      title="Löschen"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editingId ? "Mitglied bearbeiten" : "Neues Mitglied"}
              </h3>
              <Button onClick={handleCloseForm} size="icon-sm" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Vorname <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    placeholder="Max"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Nachname <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">E-Mail</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="max@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Telefon</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Firma</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Firmenname"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Position</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Position"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Straße</label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">PLZ</label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="12345"
                  />
                </div>
                <div className="col-span-2 relative" ref={citySuggestionsRef}>
                  <label className="text-sm font-medium mb-1.5 block">Stadt</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => {
                      const cityName = e.target.value
                      setFormData({ ...formData, city: cityName })
                      // Wenn Stadt gelöscht wird, auch Koordinaten löschen
                      if (!cityName) {
                        setFormData((prev) => ({ ...prev, city: "", coordinates: undefined }))
                      }
                    }}
                    placeholder="Stadt suchen (z.B. Berlin, Paris, London)..."
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      {citySuggestions.map((city) => (
                        <button
                          key={`${city.name}-${city.country}`}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{city.name}</div>
                            <div className="text-xs text-muted-foreground">{city.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.coordinates && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ✓ Koordinaten: {formData.coordinates[0].toFixed(4)}, {formData.coordinates[1].toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Land</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Deutschland"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Zusätzliche Informationen..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" onClick={handleCloseForm} variant="outline">
                  Abbrechen
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-1" />
                  {editingId ? "Speichern" : "Hinzufügen"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Beziehungen-Modal */}
      {selectedMemberForRelationships && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Beziehungen verwalten</h3>
                <p className="text-sm text-muted-foreground">
                  {members.find(m => m.id === selectedMemberForRelationships)?.firstName}{" "}
                  {members.find(m => m.id === selectedMemberForRelationships)?.lastName}
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedMemberForRelationships(null)
                  setShowRelationshipForm(false)
                  setEditingRelationshipId(null)
                }}
                size="icon-sm"
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-semibold text-lg">Beziehungen verwalten</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRelationshipsForMember(selectedMemberForRelationships).length} Beziehung{getRelationshipsForMember(selectedMemberForRelationships).length !== 1 ? 'en' : ''} vorhanden
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowRelationshipForm(true)
                    setEditingRelationshipId(null)
                    setRelationshipFormData({
                      toMemberId: "",
                      type: "other",
                      description: "",
                    })
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Neue Beziehung hinzufügen
                </Button>
              </div>

              {showRelationshipForm && (
                <div className="p-4 border-2 border-blue-500 rounded-lg bg-card space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-lg">{editingRelationshipId ? "Beziehung bearbeiten" : "Neue Beziehung hinzufügen"}</h5>
                    <Button
                      onClick={() => {
                        setShowRelationshipForm(false)
                        setEditingRelationshipId(null)
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      Zu Mitglied <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={relationshipFormData.toMemberId}
                      onChange={(e) => setRelationshipFormData({ ...relationshipFormData, toMemberId: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 rounded-lg bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">-- Bitte Mitglied auswählen --</option>
                      {members
                        .filter((m) => m.id !== selectedMemberForRelationships)
                        .map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} {member.company ? `(${member.company})` : ""} {member.city ? `- ${member.city}` : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      Beziehungstyp <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={relationshipFormData.type}
                      onChange={(e) => setRelationshipFormData({ ...relationshipFormData, type: e.target.value as RelationshipType })}
                      className="w-full px-4 py-2.5 border-2 rounded-lg bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="strategic_partnership">🤝 Strategische Partnerschaft</option>
                      <option value="customer_relationship">👤 Kundenbeziehung</option>
                      <option value="supplier_relationship">📦 Lieferantenbeziehung</option>
                      <option value="joint_venture">🤝 Joint Venture</option>
                      <option value="consulting">💼 Beratung</option>
                      <option value="collaboration">🔗 Zusammenarbeit</option>
                      <option value="investment">💰 Investition</option>
                      <option value="other">📋 Sonstiges</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      Beschreibung (optional)
                    </label>
                    <Input
                      value={relationshipFormData.description}
                      onChange={(e) => setRelationshipFormData({ ...relationshipFormData, description: e.target.value })}
                      placeholder="Zusätzliche Informationen zur Beziehung..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        setShowRelationshipForm(false)
                        setEditingRelationshipId(null)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={() => {
                        if (!relationshipFormData.toMemberId) {
                          alert("Bitte wählen Sie ein Mitglied aus")
                          return
                        }
                        if (editingRelationshipId) {
                          updateRelationship(editingRelationshipId, relationshipFormData)
                        } else {
                          addRelationship({
                            fromMemberId: selectedMemberForRelationships,
                            toMemberId: relationshipFormData.toMemberId,
                            type: relationshipFormData.type,
                            description: relationshipFormData.description || undefined,
                          })
                        }
                        setShowRelationshipForm(false)
                        setEditingRelationshipId(null)
                        setRelationshipFormData({
                          toMemberId: "",
                          type: "other",
                          description: "",
                        })
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {editingRelationshipId ? "Speichern" : "Hinzufügen"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {getRelationshipsForMember(selectedMemberForRelationships).map((rel) => {
                  const otherMemberId = rel.fromMemberId === selectedMemberForRelationships ? rel.toMemberId : rel.fromMemberId
                  const otherMember = members.find((m) => m.id === otherMemberId)
                  if (!otherMember) return null

                  const relationshipTypeLabels: Record<RelationshipType, string> = {
                    strategic_partnership: "Strategische Partnerschaft",
                    customer_relationship: "Kundenbeziehung",
                    supplier_relationship: "Lieferantenbeziehung",
                    joint_venture: "Joint Venture",
                    consulting: "Beratung",
                    collaboration: "Zusammenarbeit",
                    investment: "Investition",
                    other: "Sonstiges",
                  }

                  return (
                    <div key={rel.id} className="p-3 border rounded-lg bg-card flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {otherMember.firstName} {otherMember.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({relationshipTypeLabels[rel.type]})
                          </span>
                        </div>
                        {rel.description && <p className="text-sm text-muted-foreground mt-1">{rel.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setEditingRelationshipId(rel.id)
                            setShowRelationshipForm(true)
                            setRelationshipFormData({
                              toMemberId: otherMemberId,
                              type: rel.type,
                              description: rel.description || "",
                            })
                          }}
                          size="icon-sm"
                          variant="ghost"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm("Möchten Sie diese Beziehung wirklich löschen?")) {
                              deleteRelationship(rel.id)
                            }
                          }}
                          size="icon-sm"
                          variant="ghost"
                          title="Löschen"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {getRelationshipsForMember(selectedMemberForRelationships).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Beziehungen vorhanden
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
