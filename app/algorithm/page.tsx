import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Brain, Target, GraduationCap, Award, Briefcase, Users, TrendingUp, Calculator, BarChart3 } from "lucide-react"

export default function AlgorithmPage() {
  const criteriaExamples = [
    {
      name: "Personality",
      icon: <Users className="h-5 w-5" />,
      weight: 25,
      description: "Communication style, teamwork indicators, and soft skills",
      factors: [
        "Team collaboration keywords",
        "Leadership experience",
        "Communication skills",
        "Professional achievements",
      ],
      scoreRange: "60-100 points",
    },
    {
      name: "Skills",
      icon: <Target className="h-5 w-5" />,
      weight: 30,
      description: "Technical and job-relevant skills matching",
      factors: ["Position-specific skills", "Technical competencies", "Industry knowledge", "Tool proficiency"],
      scoreRange: "0-100 points",
    },
    {
      name: "Experience",
      icon: <Briefcase className="h-5 w-5" />,
      weight: 25,
      description: "Years of experience and position relevance",
      factors: ["Total years worked", "Relevant industry experience", "Position similarity", "Company diversity"],
      scoreRange: "20-100 points",
    },
    {
      name: "Education",
      icon: <GraduationCap className="h-5 w-5" />,
      weight: 10,
      description: "Educational background and qualifications",
      factors: ["Degree level", "Field relevance", "Institution quality", "GPA (if available)"],
      scoreRange: "30-100 points",
    },
    {
      name: "Certifications",
      icon: <Award className="h-5 w-5" />,
      weight: 10,
      description: "Professional certifications and licenses",
      factors: ["Industry certifications", "Professional licenses", "Continuing education", "Skill validations"],
      scoreRange: "20-100 points",
    },
  ]

  const scoringExample = {
    applicant: "John Smith",
    position: "Kitchen Helper",
    scores: {
      personality: 85,
      skills: 75,
      experience: 60,
      education: 70,
      certifications: 90,
    },
    weights: {
      personality: 25,
      skills: 30,
      experience: 25,
      education: 10,
      certifications: 10,
    },
  }

  const calculateWeightedScore = () => {
    let total = 0
    Object.keys(scoringExample.scores).forEach((key) => {
      const score = scoringExample.scores[key as keyof typeof scoringExample.scores]
      const weight = scoringExample.weights[key as keyof typeof scoringExample.weights] / 100
      total += score * weight
    })
    return Math.round(total)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-muted border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">HR Scoring Algorithm</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Our intelligent scoring system uses advanced OCR technology and weighted algorithms to evaluate candidates
            fairly and consistently. Learn how each criterion is assessed and scored.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Algorithm Overview */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  OCR Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Resume documents are processed using OCR technology to extract text, personal information, skills,
                  experience, and education details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Criteria Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Each criterion is scored individually based on relevance, keywords, experience level, and
                  position-specific requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Weighted Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Individual scores are combined using the weighted importance set by HR, producing a final ranked score
                  for fair comparison.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Scoring Criteria Details */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Scoring Criteria</h2>
          </div>

          <div className="grid gap-6">
            {criteriaExamples.map((criterion, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {criterion.icon}
                      {criterion.name}
                      <Badge variant="secondary">{criterion.weight}% Weight</Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">Score Range: {criterion.scoreRange}</div>
                  </div>
                  <CardDescription>{criterion.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Evaluation Factors:</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {criterion.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span className="text-sm text-muted-foreground">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scoring Example */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Scoring Example</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sample Calculation: {scoringExample.applicant}</CardTitle>
              <CardDescription>Applying for {scoringExample.position} position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {Object.keys(scoringExample.scores).map((key) => {
                  const score = scoringExample.scores[key as keyof typeof scoringExample.scores]
                  const weight = scoringExample.weights[key as keyof typeof scoringExample.weights]
                  const weightedScore = Math.round(score * (weight / 100))

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{key}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Score: {score}/100</span>
                          <span>Weight: {weight}%</span>
                          <span className="font-semibold">Weighted: {weightedScore}</span>
                        </div>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Final Weighted Score:</span>
                  <span className="text-2xl font-bold text-primary">{calculateWeightedScore()}/100</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Calculation: (85×0.25) + (75×0.30) + (60×0.25) + (70×0.10) + (90×0.10) = {calculateWeightedScore()}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Features */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Key Features</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fair & Consistent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every candidate is evaluated using the same criteria and methodology, ensuring fair comparison and
                  reducing unconscious bias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customizable Weights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  HR teams can adjust the importance of each criterion based on position requirements and company
                  priorities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  OCR technology automatically extracts information from resumes, reducing manual review time and human
                  error.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transparent Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed score breakdowns show exactly how each candidate was evaluated, providing transparency and
                  accountability.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
