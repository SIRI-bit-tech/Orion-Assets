import { BarChart3, Shield, Zap, Globe, Smartphone, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: BarChart3,
    title: "Advanced Charting",
    description:
      "Professional TradingView charts with 100+ technical indicators and drawing tools for in-depth market analysis.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Execute trades in milliseconds with our high-performance infrastructure and direct market access.",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your funds and data are protected with 256-bit encryption, 2FA, and cold storage for crypto assets.",
  },
  {
    icon: Globe,
    title: "Global Markets",
    description: "Access stocks, ETFs, crypto, forex, and commodities from exchanges worldwide, all in one platform.",
  },
  {
    icon: Smartphone,
    title: "Mobile Trading",
    description: "Trade on-the-go with our mobile-optimized platform. Full functionality on any device, anywhere.",
  },
  {
    icon: Lock,
    title: "Regulated & Compliant",
    description: "Fully licensed and regulated broker with comprehensive KYC/AML compliance and investor protection.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-balance">Everything You Need to Trade Like a Pro</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Powerful tools and features designed for both beginners and professional traders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
