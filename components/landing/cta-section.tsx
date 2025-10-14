import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-balance">Ready to Start Trading?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Join thousands of traders who trust Orion Assets for their trading needs. Open your account in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
