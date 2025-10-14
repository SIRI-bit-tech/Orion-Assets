import Link from "next/link"
import { TrendingUp } from "lucide-react"

const footerLinks = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Security", href: "/security" },
    { name: "API", href: "/api-docs" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Risk Disclosure", href: "/risk-disclosure" },
    { name: "Compliance", href: "/compliance" },
  ],
  Support: [
    { name: "Help Center", href: "/help" },
    { name: "Trading Guide", href: "/guide" },
    { name: "Status", href: "/status" },
    { name: "Contact Support", href: "/support" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Logo and description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Orion Assets</span>
            </Link>
            <p className="text-sm text-muted-foreground text-pretty">
              Professional trading platform for stocks, crypto, forex, and commodities.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Orion Assets Broker. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>

        {/* Risk disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground text-pretty">
            <strong>Risk Warning:</strong> Trading financial instruments carries a high level of risk and may not be
            suitable for all investors. The high degree of leverage can work against you as well as for you. Before
            deciding to trade, you should carefully consider your investment objectives, level of experience, and risk
            appetite. There is a possibility that you may sustain a loss of some or all of your investment. You should
            only invest money that you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  )
}
