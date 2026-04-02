import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Imóveis', href: '#imoveis' },
    { name: 'Sobre Nós', href: '#sobre' },
    { name: 'Contato', href: '#contato' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-400 border-b border-transparent',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-border/50 py-3 shadow-sm'
          : 'bg-transparent py-5',
      )}
    >
      <div className="container flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2 z-50">
          <img
            src="/logo_apresentacao_completa.jpeg"
            alt="Pistori & Associados"
            className="h-10 w-auto object-contain rounded-sm"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
          <Button
            className="bg-gold-gradient text-primary-foreground font-semibold hover:opacity-90 hover:shadow-gold-glow transition-all duration-400"
            asChild
          >
            <a href="#contato">Fale com a Assessoria</a>
          </Button>
        </nav>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:text-primary">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[350px] bg-background border-border pt-16"
          >
            <nav className="flex flex-col gap-6 items-center mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-serif text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Button
                className="bg-gold-gradient text-primary-foreground font-semibold w-full mt-4"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <a href="#contato">Fale com a Assessoria</a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
