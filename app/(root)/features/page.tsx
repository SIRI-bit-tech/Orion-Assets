import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  BarChart3,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Lock,
  TrendingUp,
  Bell,
  Code,
  Users,
  DollarSign,
  LineChart,
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Advanced Charting",
    description:
      "Professional TradingView charts with 100+ technical indicators, multiple timeframes, and advanced drawing tools for comprehensive market analysis.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description:
      "Execute trades in under 10ms with our high-performance infrastructure, direct market access, and optimized order routing.",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "256-bit encryption, two-factor authentication, cold storage for crypto assets, and regular security audits to protect your funds.",
  },
  {
    icon: Globe,
    title: "Global Markets",
    description:
      "Trade stocks, ETFs, crypto, forex, and commodities from exchanges worldwide. Access 50+ markets from a single platform.",
  },
  {
    icon: Smartphone,
    title: "Mobile Trading",
    description:
      "Full-featured mobile app for iOS and Android. Trade, analyze, and manage your portfolio on-the-go with native mobile experience.",
  },
  {
    icon: Lock,
    title: "Regulated & Compliant",
    description:
      "Fully licensed broker with comprehensive KYC/AML compliance, investor protection, and adherence to international regulations.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Data",
    description:
      "Live market data with WebSocket connections, real-time price updates, and instant order notifications for informed trading decisions.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Customizable price alerts, technical indicator notifications, and news alerts to never miss important market movements.",
  },
  {
    icon: Code,
    title: "API Access",
    description:
      "RESTful API and WebSocket feeds for algorithmic trading, custom integrations, and automated trading strategies.",
  },
  {
    icon: Users,
    title: "Social Trading",
    description:
      "Follow successful traders, copy their strategies, and learn from the community with our social trading features.",
  },
  {
    icon: DollarSign,
    title: "Competitive Pricing",
    description: "Low commissions, tight spreads, and transparent fee structure. No hidden costs or surprise charges.",
  },
  {
    icon: LineChart,
    title: "Portfolio Analytics",
    description:
      "Comprehensive portfolio tracking, performance analytics, risk metrics, and detailed reporting for better investment decisions.",
  },
]

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold mb-6 text-balance">Powerful Features for Modern Traders</h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              Everything you need to trade successfully in one comprehensive platform
            </p>
            <Button asChild size="lg">
              <Link href="/signup">Start Trading Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50">
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

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-4 text-balance">Ready to Experience the Difference?</h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Join thousands of traders who have already made the switch to Orion Assets
            </p>
            <Button asChild size="lg">
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
