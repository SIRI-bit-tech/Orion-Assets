import { Footer } from "@/components/landing/footer"
import { PricingSection } from "@/components/landing/pricing-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold mb-6 text-balance">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              No hidden fees. No surprises. Just straightforward pricing that scales with your trading needs.
            </p>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Are there any hidden fees?</h3>
                <p className="text-muted-foreground">
                  No. We believe in transparent pricing. All fees are clearly disclosed upfront with no hidden charges.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I change my plan later?</h3>
                <p className="text-muted-foreground">
                  Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Yes. Professional plan includes a 14-day free trial. No credit card required to start.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, bank transfers, and cryptocurrency payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-4 text-balance">Still Have Questions?</h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Our team is here to help you choose the right plan for your trading needs
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
