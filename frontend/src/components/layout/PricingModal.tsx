import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Sparkles } from "lucide-react"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

const plans = [
  {
    name: "Hobby",
    price: "$0",
    description: "Perfect for students and casual reading.",
    features: ["5 Papers / month", "Basic Q&A Chat", "Standard Summaries"],
    buttonText: "Current Plan",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "Ideal for active researchers and professionals.",
    features: ["Unlimited Papers", "Advanced Multi-Agent Reports", "Citation Extraction", "Priority LLM Access"],
    buttonText: "Upgrade to Pro",
    buttonVariant: "primary",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For research labs and large organizations.",
    features: ["Custom Integrations", "Dedicated Account Manager", "SSO Authentication", "Unlimited API Access"],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
]

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 md:p-10 text-center relative overflow-hidden flex-shrink-0">
            {/* Background glow */}
            <div className="absolute top-[-50%] left-[25%] w-[50%] h-[200%] rounded-full bg-primary/10 blur-[100px] -z-10" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Upgrade your research
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock the full power of Lumina Research Multi-Agent AI to accelerate your literature reviews.
            </p>
          </div>

          <div className="p-6 md:p-10 pt-0 overflow-y-auto grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border ${
                  plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"
                } bg-card p-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                    {plan.price}
                    {plan.period && <span className="ml-1 text-xl font-medium text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-auto w-full rounded-xl py-3 px-4 text-sm font-semibold transition-all ${
                    plan.buttonVariant === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50"
                  }`}
                  onClick={() => {
                    if (plan.buttonVariant === "primary") {
                      alert("Redirecting to Stripe checkout...")
                    } else {
                      onClose()
                    }
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
