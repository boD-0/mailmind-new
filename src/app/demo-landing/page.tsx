import React from 'react';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import WhySwitch from '@/components/landing/WhySwitch';
import FeatureWalkthrough from '@/components/landing/FeatureWalkthrough';
import Pricing from '@/components/landing/Pricing';
import TestimonialsSection from '@/components/ui/testimonials-section';
import Footer from '@/components/landing/Footer';

export default function DemoLandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Nav />
      <Hero />
      <WhySwitch />
      <FeatureWalkthrough />
      <Pricing />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
