import { HeroSection } from './sections/HeroSection'
import { PropertiesSection } from './sections/PropertiesSection'
import { AboutSection } from './sections/AboutSection'
import { ContactSection } from './sections/ContactSection'

const Index = () => {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <PropertiesSection />
      <AboutSection />
      <ContactSection />
    </div>
  )
}

export default Index
