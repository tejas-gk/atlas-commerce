import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search } from "lucide-react"
import { WEBSITE_TEMPLATES } from "@/lib/template-library"

const categories = ["all", ...Array.from(new Set(WEBSITE_TEMPLATES.map((template) => template.category)))]

function TemplateGrid({ category }: { category: string }) {
  const templates =
    category === "all"
      ? WEBSITE_TEMPLATES
      : WEBSITE_TEMPLATES.filter((template) => template.category === category)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <Card key={template.key} className="overflow-hidden">
          <CardHeader className="space-y-0 p-0">
            <img
              src={template.thumbnail || "/placeholder.svg"}
              alt={template.name}
              className="aspect-[3/2] w-full object-cover"
            />
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: template.accentColor }}
            />
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{template.name}</CardTitle>
              <span className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {template.category}
              </span>
            </div>
            <CardDescription>{template.summary}</CardDescription>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </CardContent>
          <CardFooter className="flex gap-2 p-4 pt-0">
            <Link href={`/dashboard?template=${template.key}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Preview Flow
              </Button>
            </Link>
            <Link href={`/dashboard?template=${template.key}`} className="flex-1">
              <Button className="w-full">Use Template</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search templates..." className="w-[200px] pl-8 md:w-[300px]" />
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground">
              Start from conversion-focused storefront templates and customize everything after launch.
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="flex flex-wrap">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category === "all" ? "All Templates" : category.replace("-", " ")}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-6">
                <TemplateGrid category={category} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
