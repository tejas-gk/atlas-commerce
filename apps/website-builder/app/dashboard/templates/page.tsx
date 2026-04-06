import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search } from "lucide-react"

export default function TemplatesPage() {
  // Mock data for templates
  const templates = [
    { id: 1, name: "Business", category: "business", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 2, name: "Portfolio", category: "portfolio", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 3, name: "E-commerce", category: "ecommerce", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 4, name: "Blog", category: "blog", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 5, name: "Restaurant", category: "business", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 6, name: "Photography", category: "portfolio", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 7, name: "Online Store", category: "ecommerce", thumbnail: "/placeholder.svg?height=200&width=300" },
    { id: 8, name: "News", category: "blog", thumbnail: "/placeholder.svg?height=200&width=300" },
  ]

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
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground">Choose a template to start your website</p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <img
                        src={template.thumbnail || "/placeholder.svg"}
                        alt={template.name}
                        className="aspect-[3/2] w-full object-cover"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" className="w-full">
                        Preview
                      </Button>
                      <Button className="ml-2 w-full">Use Template</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates
                  .filter((template) => template.category === "business")
                  .map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-0">
                        <img
                          src={template.thumbnail || "/placeholder.svg"}
                          alt={template.name}
                          className="aspect-[3/2] w-full object-cover"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Preview
                        </Button>
                        <Button className="ml-2 w-full">Use Template</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates
                  .filter((template) => template.category === "portfolio")
                  .map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-0">
                        <img
                          src={template.thumbnail || "/placeholder.svg"}
                          alt={template.name}
                          className="aspect-[3/2] w-full object-cover"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Preview
                        </Button>
                        <Button className="ml-2 w-full">Use Template</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="ecommerce" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates
                  .filter((template) => template.category === "ecommerce")
                  .map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-0">
                        <img
                          src={template.thumbnail || "/placeholder.svg"}
                          alt={template.name}
                          className="aspect-[3/2] w-full object-cover"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Preview
                        </Button>
                        <Button className="ml-2 w-full">Use Template</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="blog" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates
                  .filter((template) => template.category === "blog")
                  .map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-0">
                        <img
                          src={template.thumbnail || "/placeholder.svg"}
                          alt={template.name}
                          className="aspect-[3/2] w-full object-cover"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Preview
                        </Button>
                        <Button className="ml-2 w-full">Use Template</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

