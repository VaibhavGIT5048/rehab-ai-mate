import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary-soft/20 to-muted">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <Badge variant="outline" className="mb-6 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-2" />
              AI-Powered Rehabilitation
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Smart Recovery,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Better Results
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Combine AI-powered exercise tracking with professional healthcare guidance. 
              Track your progress, connect with experts, and recover faster with personalized rehabilitation plans.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group">
                Start Your Recovery
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-border">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Patients Helped</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Recovery Rate</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Professionals</div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative">
              <img
                src={heroImage}
                alt="Professional physiotherapist helping patient with rehabilitation exercises"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-card border border-border rounded-lg p-3 shadow-lg animate-pulse-gentle">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs font-medium">AI Tracking Active</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
                <div className="text-xs text-muted-foreground mb-1">Progress Today</div>
                <div className="text-lg font-bold text-primary">85%</div>
                <div className="w-16 h-1 bg-muted rounded-full">
                  <div className="w-4/5 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;