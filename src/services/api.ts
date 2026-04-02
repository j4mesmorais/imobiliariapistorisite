import aldeiaMainImg from '@/assets/fotopequena1-a3925.jpg'

export interface PropertyData {
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

const mockProperties: PropertyData[] = [
  {
    id: 'aldeia-do-lago',
    title: 'Aldeia do Lago',
    highlight: 'Chácaras de Lazer',
    location: 'Santa Bárbara de Goiás',
    description:
      'Lotes em condomínio fechado com infraestrutura de alto padrão na região de Santa Bárbara de Goiás. Desfrute de um estilo de vida sofisticado e voltado ao bem-estar em contato direto com a natureza.',
    image: aldeiaMainImg,
    price: 'Parcelas a partir de R$ 439,90',
    area: '450m² a 1.117m²',
    amenities: [
      'Academia',
      'Jardim',
      'Área de Recreação Infantil',
      'Salão para Festas e Eventos',
      'Piscina',
      'Quadra Poliesportiva',
      'Churrasqueira',
      'Lago de Pesca',
    ],
  },
  {
    id: 'quintas-do-cerrado',
    title: 'Quintas do Cerrado',
    highlight: 'Condomínio-fazenda',
    location: 'Trindade',
    description:
      'Um autêntico condomínio-fazenda exclusivo no coração do Cerrado, com área verde de 250 mil m², ideal para quem busca tranquilidade, segurança e uma imersão na natureza.',
    image: 'https://img.usecurling.com/p/800/600?q=farm%20fire%20pit&color=black',
    secondaryImage: 'https://img.usecurling.com/p/800/600?q=aerial%20lake%20pool&color=green',
    price: 'A consultar',
    area: 'Lotes de 1.000m²',
    amenities: [
      'Mais de 250.000m² de área verde',
      'Trilhas',
      'Lagos',
      'Quadras',
      'Academia',
      'Piscina',
      'Salão de festas',
    ],
  },
  {
    id: 'reserva-dos-ipes',
    title: 'Reserva dos Ipês',
    highlight: 'Loteamento Premium',
    location: 'Goiânia',
    description:
      'Loteamento premium com localização privilegiada. Infraestrutura completa e segurança 24h para você construir a casa dos seus sonhos em um ambiente familiar e arborizado.',
    image: 'https://img.usecurling.com/p/800/600?q=luxury%20modern%20house&color=black',
    price: 'A consultar',
    area: 'Lotes de 360m² a 600m²',
    amenities: [
      'Segurança 24h',
      'Parque Linear',
      'Pista de Caminhada',
      'Playground',
      'Quadra de Tênis',
      'Pet Place',
    ],
  },
]

export const fetchPropertiesData = async (): Promise<PropertyData[]> => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Fallback to mock data to ensure end-to-end functionality when env vars are missing
    return new Promise((resolve) => setTimeout(() => resolve(mockProperties), 800))
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/imoveis?select=*&ativo=eq.true`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()

    // Validate if data is empty, fall back to mock data
    if (!data || data.length === 0) {
      return mockProperties
    }

    return data.map((entry: any) => ({
      id: entry.id ? String(entry.id) : entry.titulo,
      title: entry.titulo,
      highlight: entry.subtitulo,
      location: entry.subtitulo || 'Não informado',
      description: entry.resumo || 'Nenhuma descrição',
      image: entry.imagem_url ? '/img/' + entry.imagem_url.split('/').pop() : '',
      price: entry.preco || 'A consultar',
      area: 'Consulte-nos',
      amenities: []
    })) as PropertyData[]
  } catch (error) {
    console.error('Failed to fetch properties from Supabase, falling back to mock:', error)
    return mockProperties
  }
}
