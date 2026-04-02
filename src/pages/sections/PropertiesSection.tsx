import { useEffect, useRef, useState } from 'react'
import { PropertyCard } from '@/components/PropertyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPropertiesData, type PropertyData } from '@/services/api'

export function PropertiesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPropertiesData()
        setProperties(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <section
      id="imoveis"
      ref={sectionRef}
      className="bg-[#0A0A0A] py-24 text-neutral-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900/40 via-transparent to-transparent opacity-70 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Empreendimentos em <span className="text-[#D4AF37]">Destaque</span>
            </h2>
            <p className="font-sans text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Descubra oportunidades únicas e exclusivas para o seu bem-estar e investimento
              inteligente na região metropolitana de Goiânia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:max-w-7xl lg:mx-auto">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col h-full shadow-lg"
                  >
                    <Skeleton className="w-full aspect-[4/3] bg-neutral-800/60" />
                    <div className="p-6 flex flex-col flex-grow gap-4">
                      <Skeleton className="w-3/4 h-8 bg-neutral-800/60" />
                      <Skeleton className="w-1/2 h-4 bg-neutral-800/60 mb-2" />
                      <Skeleton className="w-full h-24 bg-neutral-800/60" />
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-4">
                        <Skeleton className="w-full h-14 bg-neutral-800/60 rounded-xl" />
                        <Skeleton className="w-full h-14 bg-neutral-800/60 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))
              : properties.map((property, index) => (
                  <div
                    key={property.id}
                    className={`transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} h-full`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
          </div>


        </div>
      </div>
    </section>
  )
}
