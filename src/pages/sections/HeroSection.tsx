import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://img.usecurling.com/p/1920/1080?q=horizontal%20condominium%20nature"
          alt="Horizontal condominium in nature"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background"></div>
      </div>

      <div
        ref={ref}
        className={`container relative z-10 flex flex-col items-center text-center max-w-4xl px-4 ${isVisible ? 'animate-slide-up-fade opacity-100' : 'opacity-0'}`}
      >
        <span className="text-primary tracking-[0.3em] text-sm uppercase font-semibold mb-6">
          Qualidade de Vida e Bem-Estar
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-8 drop-shadow-lg">
          Descubra o Lar do Seu <span className="text-gradient-gold">Novo Recomeço em Goiânia</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl font-light">
          Especialistas em conectar seus desejos de vida às melhores oportunidades do mercado
          imobiliário em harmonia com a natureza.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            className="bg-gold-gradient text-primary-foreground font-semibold hover:shadow-gold-glow transition-all duration-400 text-base px-8 h-14"
            asChild
          >
            <a href="#imoveis">
              Ver Imóveis <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 transition-all duration-400 text-base px-8 h-14 bg-transparent"
            asChild
          >
            <a href="https://wa.me/556239141992" target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce">
        <span className="text-xs text-foreground/50 tracking-widest uppercase mb-2">Rolar</span>
        <div className="w-[1px] h-10 bg-primary/50"></div>
      </div>
    </section>
  )
}
