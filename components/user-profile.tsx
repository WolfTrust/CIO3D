"use client"

import { useState, useEffect } from "react"
import { User, Camera, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserProfile {
  name: string
  avatar: string
  bio: string
  homeCountry: string
  travelingSince: string
}

const defaultProfile: UserProfile = {
  name: "Reisender",
  avatar: "",
  bio: "Auf der Suche nach neuen Abenteuern",
  homeCountry: "",
  travelingSince: new Date().getFullYear().toString(),
}

const avatarOptions = [
  "/adventurer-avatar.jpg",
  "/explorer-avatar.png",
  "/traveler-avatar-cartoon.jpg",
  "/backpacker-avatar.jpg",
  "/globe-trotter-avatar.jpg",
  "/wanderer-avatar.jpg",
]

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(defaultProfile)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("wanderlust-profile")
    if (saved) {
      const parsed = JSON.parse(saved)
      setProfile(parsed)
      setEditedProfile(parsed)
    }
  }, [])

  const handleSave = () => {
    setProfile(editedProfile)
    localStorage.setItem("wanderlust-profile", JSON.stringify(editedProfile))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleAvatarSelect = (avatar: string) => {
    setEditedProfile({ ...editedProfile, avatar })
    setShowAvatarPicker(false)
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Mein Profil
        </h3>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Check className="w-4 h-4 text-green-500" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden border-2 border-primary/30">
            {profile.avatar ? (
              <img src={profile.avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          {isEditing && (
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          )}
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-secondary/50 rounded-xl">
            {avatarOptions.map((avatar, i) => (
              <button
                key={i}
                onClick={() => handleAvatarSelect(avatar)}
                className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
              >
                <img
                  src={avatar || "/placeholder.svg"}
                  alt={`Avatar ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Profile Info */}
        {isEditing ? (
          <div className="w-full space-y-3">
            <Input
              placeholder="Dein Name"
              value={editedProfile.name}
              onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              className="text-center"
            />
            <Input
              placeholder="Kurze Bio"
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              className="text-center"
            />
            <Input
              placeholder="Reise-Jahr (seit wann reist du?)"
              value={editedProfile.travelingSince}
              onChange={(e) => setEditedProfile({ ...editedProfile, travelingSince: e.target.value })}
              className="text-center"
            />
          </div>
        ) : (
          <div className="text-center">
            <h4 className="font-semibold text-lg">{profile.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
            {profile.travelingSince && (
              <p className="text-xs text-muted-foreground mt-2">Reist seit {profile.travelingSince}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
