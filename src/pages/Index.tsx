import Hero from "@/components/Hero";
import Coverages from "@/components/Coverages";
import Plans from "@/components/Plans";
import Differentials from "@/components/Differentials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <Coverages />
      <Plans />
      <Differentials />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
