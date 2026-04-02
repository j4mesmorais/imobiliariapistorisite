import { MapPin, Phone, Mail, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand & Socials */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-widest text-white uppercase leading-none">
              Pistori & Associados
            </span>
            <span className="text-xs tracking-[0.2em] text-primary uppercase mt-1">
              Empreendimentos Imobiliários
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Especialistas em conectar seus desejos de vida às melhores oportunidades do mercado
            imobiliário em harmonia com a natureza.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="font-serif text-lg font-semibold text-white">Contato</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <span>
                Av. Perimetral Norte, 15
                <br />
                Pátio Vitta - Goiânia-GO
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span>(62) 3914-1992</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span>pistoriimobiliaria@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Map Placeholder */}
        <div className="space-y-6 h-full min-h-[200px] flex flex-col">
          <h4 className="font-serif text-lg font-semibold text-white">Localização</h4>
          <div className="relative flex-1 rounded-md overflow-hidden border border-border">
            {/* Embedded Google Maps placeholder styled for dark mode */}
            <iframe
              title="Google Maps Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3822.427845763073!2d-49.2625!3d-16.6528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDM5JzEwLjEiUyA0OcKwMTUnNDUuMCJX!5e0!3m2!1sen!2sbr!4v1630000000000!5m2!1sen!2sbr"
              className="absolute inset-0 w-full h-full border-0 filter invert-[90%] hue-rotate-180 contrast-80 opacity-80"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="container border-t border-border pt-8 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Pistori & Associados Empreendimentos Imobiliários. Todos
          os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
