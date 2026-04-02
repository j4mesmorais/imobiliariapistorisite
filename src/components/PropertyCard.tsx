import {
  MapPin,
  Fish,
  Dumbbell,
  Waves,
  Dribbble,
  PartyPopper,
  Flame,
  Gamepad2,
  Maximize2,
  DollarSign,
  TreePine,
  Map as MapIcon,
  MessageCircle,
  ShieldCheck,
  Trees,
  Footprints,
  Dog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    highlight?: string
    location: string
    description: string
    image: string
    secondaryImage?: string
    price: string
    area: string
    amenities: string[]
  }
}

const amenityIcons: Record<string, React.ReactNode> = {
  'Lago de Pesca': <Fish className="w-4 h-4" />,
  Jardim: <TreePine className="w-4 h-4" />,
  Lagos: <Fish className="w-4 h-4" />,
  Academia: <Dumbbell className="w-4 h-4" />,
  Piscina: <Waves className="w-4 h-4" />,
  'Quadra Poliesportiva': <Dribbble className="w-4 h-4" />,
  Quadras: <Dribbble className="w-4 h-4" />,
  'Área de Recreação Infantil': <Gamepad2 className="w-4 h-4" />,
  'Salão para Festas e Eventos': <PartyPopper className="w-4 h-4" />,
  'Salão de festas': <PartyPopper className="w-4 h-4" />,
  Churrasqueira: <Flame className="w-4 h-4" />,
  Trilhas: <MapIcon className="w-4 h-4" />,
  'Mais de 250.000m² de área verde': <TreePine className="w-4 h-4" />,
  'Segurança 24h': <ShieldCheck className="w-4 h-4" />,
  'Parque Linear': <Trees className="w-4 h-4" />,
  'Pista de Caminhada': <Footprints className="w-4 h-4" />,
  Playground: <Gamepad2 className="w-4 h-4" />,
  'Quadra de Tênis': <Dribbble className="w-4 h-4" />,
  'Pet Place': <Dog className="w-4 h-4" />,
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="group overflow-hidden bg-neutral-900 border-neutral-800 transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] flex flex-col h-full rounded-2xl">
      <div className="relative w-full overflow-hidden bg-neutral-950 group/image">
        <AspectRatio ratio={4 / 3}>
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${property.secondaryImage ? 'group-hover/image:opacity-0' : ''}`}
          />
          {property.secondaryImage && (
            <img
              src={property.secondaryImage}
              alt={`${property.title} - Vista secundária`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover/image:opacity-100 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/50 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-neutral-950 font-semibold border-none shadow-md">
                Lançamento
              </Badge>
              {property.highlight && (
                <Badge
                  variant="secondary"
                  className="bg-neutral-900/80 hover:bg-neutral-900 text-white border border-neutral-700 backdrop-blur-sm"
                >
                  {property.highlight}
                </Badge>
              )}
            </div>
            <h3 className="font-serif text-2xl font-bold text-white leading-tight">
              {property.title}
            </h3>
            <p className="flex items-center text-neutral-300 text-sm mt-2 font-sans">
              <MapPin className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
              {property.location}
            </p>
          </div>
        </AspectRatio>
      </div>

      <CardContent className="p-6 flex flex-col flex-grow">
        <p className="text-neutral-400 font-sans text-sm mb-6 flex-grow leading-relaxed">
          {property.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 font-sans uppercase tracking-wider mb-1">
              Metragem
            </span>
            <span className="flex items-center text-sm font-semibold text-neutral-200">
              <Maximize2 className="w-4 h-4 mr-2 text-[#D4AF37]" />
              {property.area}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 font-sans uppercase tracking-wider mb-1">
              Investimento
            </span>
            <span className="flex items-center text-sm font-semibold text-neutral-200">
              <DollarSign className="w-4 h-4 mr-2 text-[#D4AF37]" />
              {property.price}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <span className="text-xs text-neutral-500 font-sans uppercase tracking-wider mb-3 block">
            Diferenciais de Bem-estar
          </span>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center text-xs font-sans text-neutral-300 bg-neutral-800/40 px-2.5 py-1.5 rounded-md border border-neutral-700/50 transition-colors hover:border-[#D4AF37]/30 hover:bg-neutral-800"
              >
                <span className="text-[#D4AF37] mr-2">
                  {amenityIcons[amenity] || <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />}
                </span>
                {amenity}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-neutral-950 font-semibold transition-all duration-300 font-sans shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 flex items-center justify-center gap-2"
          size="lg"
          onClick={() =>
            window.open(
              'https://wa.me/556239141992?text=' +
                encodeURIComponent(
                  `Olá, gostaria de falar com um corretor sobre o empreendimento ${property.title}.`,
                ),
              '_blank',
            )
          }
        >
          <MessageCircle className="w-5 h-5" />
          Falar com Corretor
        </Button>
      </CardFooter>
    </Card>
  )
}
