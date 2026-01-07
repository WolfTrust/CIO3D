"use client"

import { countries } from "@/lib/countries-data"
import { useState, useCallback, useEffect } from "react"
import { Brain, Check, X, Trophy, RotateCcw, Flag, Building, Globe } from "lucide-react"

type QuizType = "capital" | "flag" | "country"

interface Question {
  country: (typeof countries)[0]
  options: string[]
  correctAnswer: string
  type: QuizType
  questionText: string
}

export function CountryQuiz() {
  const [quizType, setQuizType] = useState<QuizType>("capital")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("quiz-best-streak")
    if (saved) setBestStreak(Number(saved))
  }, [])

  const generateQuestion = useCallback((): Question => {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    const otherCountries = countries.filter((c) => c.id !== randomCountry.id)
    const shuffledOthers = otherCountries.sort(() => Math.random() - 0.5).slice(0, 3)

    if (quizType === "capital") {
      // Show flag, ask for capital
      const options = [randomCountry.capital, ...shuffledOthers.map((c) => c.capital)].sort(() => Math.random() - 0.5)
      return {
        country: randomCountry,
        options,
        correctAnswer: randomCountry.capital,
        type: "capital",
        questionText: `Was ist die Hauptstadt von ${randomCountry.name}?`,
      }
    } else if (quizType === "flag") {
      // Show country name, ask to identify flag
      const options = [randomCountry.flag, ...shuffledOthers.map((c) => c.flag)].sort(() => Math.random() - 0.5)
      return {
        country: randomCountry,
        options,
        correctAnswer: randomCountry.flag,
        type: "flag",
        questionText: `Welche Flagge gehört zu ${randomCountry.name}?`,
      }
    } else {
      // Show flag, ask for country name
      const options = [randomCountry.name, ...shuffledOthers.map((c) => c.name)].sort(() => Math.random() - 0.5)
      return {
        country: randomCountry,
        options,
        correctAnswer: randomCountry.name,
        type: "country",
        questionText: "Zu welchem Land gehört diese Flagge?",
      }
    }
  }, [quizType])

  const startNewQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion())
    setSelectedAnswer(null)
  }, [generateQuestion])

  useEffect(() => {
    if (mounted && !currentQuestion) {
      startNewQuestion()
    }
  }, [mounted, currentQuestion, startNewQuestion])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(answer)
    setTotalAnswered((t) => t + 1)

    if (answer === currentQuestion?.correctAnswer) {
      setScore((s) => s + 1)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
        localStorage.setItem("quiz-best-streak", String(newStreak))
      }
    } else {
      setStreak(0)
    }
  }

  const resetQuiz = () => {
    setScore(0)
    setTotalAnswered(0)
    setStreak(0)
    startNewQuestion()
  }

  if (!mounted || !currentQuestion) return null

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer
  const hasAnswered = selectedAnswer !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Länder-Quiz
        </h3>
        <button onClick={resetQuiz} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => {
            setQuizType("capital")
            startNewQuestion()
          }}
          className={`flex-1 py-2 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
            quizType === "capital" ? "bg-background shadow" : "hover:bg-background/50"
          }`}
        >
          <Building className="w-3 h-3" />
          Hauptstädte
        </button>
        <button
          onClick={() => {
            setQuizType("flag")
            startNewQuestion()
          }}
          className={`flex-1 py-2 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
            quizType === "flag" ? "bg-background shadow" : "hover:bg-background/50"
          }`}
        >
          <Flag className="w-3 h-3" />
          Flaggen
        </button>
        <button
          onClick={() => {
            setQuizType("country")
            startNewQuestion()
          }}
          className={`flex-1 py-2 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
            quizType === "country" ? "bg-background shadow" : "hover:bg-background/50"
          }`}
        >
          <Globe className="w-3 h-3" />
          Länder
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-primary">{score}</p>
          <p className="text-xs text-muted-foreground">Richtig</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">Serie</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-500">{bestStreak}</p>
          <p className="text-xs text-muted-foreground">Rekord</p>
        </div>
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {quizType === "capital" && (
          <div className="text-center mb-4">
            <span className="text-6xl mb-3 block">{currentQuestion.country.flag}</span>
            <p className="text-muted-foreground text-sm">{currentQuestion.questionText}</p>
          </div>
        )}
        {quizType === "flag" && (
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-sm">{currentQuestion.questionText}</p>
          </div>
        )}
        {quizType === "country" && (
          <div className="text-center mb-4">
            <span className="text-6xl mb-3 block">{currentQuestion.country.flag}</span>
            <p className="text-muted-foreground text-sm">{currentQuestion.questionText}</p>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === currentQuestion.correctAnswer

            let buttonClass = "border-border hover:border-primary/50"
            if (hasAnswered) {
              if (isCorrectOption) {
                buttonClass = "border-green-500 bg-green-500/10"
              } else if (isSelected && !isCorrectOption) {
                buttonClass = "border-red-500 bg-red-500/10"
              }
            } else if (isSelected) {
              buttonClass = "border-primary bg-primary/10"
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={hasAnswered}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${buttonClass}`}
              >
                {quizType === "flag" ? (
                  <span className="text-4xl">{option}</span>
                ) : (
                  <span className="text-sm font-medium">{option}</span>
                )}
                {hasAnswered && isCorrectOption && <Check className="w-5 h-5 text-green-500" />}
                {hasAnswered && isSelected && !isCorrectOption && <X className="w-5 h-5 text-red-500" />}
              </button>
            )
          })}
        </div>

        {hasAnswered && (
          <div className="mt-4">
            <div
              className={`text-center p-3 rounded-xl mb-3 ${
                isCorrect ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}
            >
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Richtig!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">Falsch!</span>
                  <span className="text-sm">
                    Richtige Antwort:{" "}
                    {quizType === "flag" ? (
                      <span className="text-2xl">{currentQuestion.correctAnswer}</span>
                    ) : (
                      currentQuestion.correctAnswer
                    )}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={startNewQuestion}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Nächste Frage
            </button>
          </div>
        )}
      </div>

      {totalAnswered > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {score} von {totalAnswered} richtig ({Math.round((score / totalAnswered) * 100)}%)
        </p>
      )}
    </div>
  )
}
