"use client"

import { useState } from "react"
import { Globe, MapPin, Target, Trophy, ChevronRight, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      icon: Globe,
      title: "Willkommen bei Wanderlust",
      description: "Deine persönliche Weltkarte, um alle Reisen zu dokumentieren und neue Abenteuer zu planen.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MapPin,
      title: "Markiere besuchte Länder",
      description: "Tippe auf ein Land auf dem Globus, um es als besucht, gelebt oder Bucket-List zu markieren.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Erfasse Reiseorte",
      description: "Füge innerhalb jedes Landes spezifische Orte hinzu - Städte, Strände, Berge und mehr.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Trophy,
      title: "Schalte Erfolge frei",
      description: "Sammle Achievements, verfolge deine Statistiken und werde zum Weltenbummler.",
      color: "from-purple-500 to-pink-500",
    },
  ]

  const currentStep = steps[step]
  const Icon = currentStep.icon

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={onComplete} className="text-muted-foreground">
          <X className="w-4 h-4 mr-1" />
          Überspringen
        </Button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-16">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-8">
        {/* Animated Icon */}
        <div
          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center mb-10 shadow-2xl animate-float`}
        >
          <Icon className="w-16 h-16 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">{currentStep.title}</h1>
        <p className="text-muted-foreground text-center max-w-xs leading-relaxed">{currentStep.description}</p>
      </div>

      {/* Action Button */}
      <div className="p-6 pb-10">
        <Button onClick={handleNext} className="w-full h-14 text-base font-semibold rounded-2xl" size="lg">
          {step === steps.length - 1 ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Los geht's
            </>
          ) : (
            <>
              Weiter
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
