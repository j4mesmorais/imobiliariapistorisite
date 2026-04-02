import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { Check } from 'lucide-react'

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal()

  const benefits = [
    'Atendimento humanizado e escuta ativa',
    'Assessoria jurídica e administrativa completa',
    'Curadoria criteriosa de imóveis de alto padrão',
    'Foco na segurança e exclusividade',
  ]

  return (
    <section
      id="sobre"
      className="py-24 bg-card relative overflow-hidden border-y border-border/50"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="container relative z-10">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center ${isVisible ? 'animate-slide-up-fade opacity-100' : 'opacity-0'}`}
        >
          <div className="relative">
            <div className="absolute -inset-4 border border-primary/20 rounded-lg translate-x-4 translate-y-4 -z-10"></div>
            <img
              src="https://img.usecurling.com/p/800/1000?q=woman%20nature%20office%20plants"
              alt="Nossa História"
              className="rounded-lg object-cover w-full h-[600px] shadow-2xl"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-primary tracking-widest text-sm uppercase font-semibold mb-3">
              Nossa História
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Muito além de tijolos, nós construímos conexões.
            </h2>
            <div className="h-1 w-16 bg-primary rounded-full mb-8"></div>

            <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
              <p>
                A Pistori & Associados nasceu da compreensão humana de que mudar de casa é,
                frequentemente, recomeçar uma história.
              </p>
              <p>
                Liderada por uma profissional com sólida bagagem em administração, mas com o olhar
                sensível de uma terapeuta experiente, nossa assessoria aplica a escuta ativa para
                entender não apenas o orçamento, mas as vibrações e as necessidades reais da sua
                família.
              </p>
              <p>
                Transformamos a ansiedade da busca em uma jornada tranquila, segura e repleta de
                transparência.
              </p>
            </div>

            <ul className="mt-8 space-y-4">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
