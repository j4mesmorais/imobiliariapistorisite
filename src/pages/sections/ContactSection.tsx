import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { ContactForm } from '@/components/ContactForm'

export function ContactSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="contato" className="py-24 bg-background relative">
      <div className="container max-w-5xl">
        <div
          ref={ref}
          className={`grid lg:grid-cols-5 gap-12 bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-2xl ${isVisible ? 'animate-slide-up-fade opacity-100' : 'opacity-0'}`}
        >
          <div className="lg:col-span-2 flex flex-col justify-center">
            <span className="text-primary tracking-widest text-sm uppercase font-semibold mb-3">
              Assessoria Exclusiva
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Dê o primeiro passo para o seu novo lar
            </h2>
            <p className="text-muted-foreground mb-8 text-lg font-light">
              Deixe seus dados e nossa equipe de especialistas entrará em contato para entender suas
              necessidades e apresentar as melhores oportunidades.
            </p>

            <div className="p-6 bg-background rounded-lg border border-primary/20">
              <h4 className="font-serif font-medium text-white mb-2">Atendimento Imediato</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Prefere conversar agora? Chame nossa equipe diretamente pelo WhatsApp.
              </p>
              <a
                href="https://wa.me/556239141992"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary font-medium hover:underline transition-all"
              >
                (62) 3914-1992
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
