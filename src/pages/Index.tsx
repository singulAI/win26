import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Coverages from "@/components/Coverages";
import Plans from "@/components/Plans";
import Differentials from "@/components/Differentials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <main className="bg-background text-foreground">
      <Hero isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
      <Coverages />
      <Plans />
      <Differentials />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
