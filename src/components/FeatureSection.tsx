import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Activity, 
  BarChart3, 
  Users, 
  Brain, 
  Shield,
  Clock,
  Target
} from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI-Powered Chat",
      description: "Real-time conversations with AI-enhanced healthcare professionals for immediate guidance and support.",
      badge: "Smart",
      color: "text-blue-600"
    },
    {
      icon: Activity,
      title: "Exercise Tracking",
      description: "Computer vision-based form analysis with real-time feedback to ensure proper technique and prevent injury.",
      badge: "Precise",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Comprehensive recovery tracking with beautiful visualizations to monitor your improvement over time.",
      badge: "Insights",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with verified physiotherapists and doctors for expert guidance throughout your recovery.",
      badge: "Expert",
      color: "text-orange-600"
    },
    {
      icon: Brain,
      title: "Personalized Plans",
      description: "AI-generated rehabilitation programs tailored to your specific condition and recovery goals.",
      badge: "Custom",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring your medical data and progress remain completely confidential.",
      badge: "Secure",
      color: "text-red-600"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access your rehabilitation tools and AI assistance anytime, anywhere for continuous support.",
      badge: "Always On",
      color: "text-teal-600"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and achieve specific recovery milestones with intelligent goal setting and progress monitoring.",
      badge: "Focused",
      color: "text-indigo-600"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20">
            Complete Platform
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {" "}Smart Recovery
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with professional healthcare expertise 
            to deliver personalized rehabilitation experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-primary-soft ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Recovery?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of patients who have accelerated their recovery with RehabAI's intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors">
                Start Free Trial
              </button>
              <button className="border border-border hover:bg-muted text-foreground px-6 py-3 rounded-lg font-medium transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;