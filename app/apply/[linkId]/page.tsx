import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ApplicationForm from "@/components/ApplicationForm"

interface PageProps {
  params: { linkId: string }
}

export default async function ApplicationPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: ranking, error } = await supabase
    .from("rankings")
    .select("*")
    .eq("application_link_id", params.linkId)
    .eq("is_active", true)
    .single()

  if (error || !ranking) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">{ranking.title}</h1>
          <p className="text-lg text-muted-foreground capitalize">{ranking.position.replace("/", " / ")}</p>
          {ranking.description && <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{ranking.description}</p>}
        </div>

        <ApplicationForm ranking={ranking} />
      </div>
    </div>
  )
}
