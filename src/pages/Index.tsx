import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Utensils, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-food-bg.jpg";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Good Food Connect
            </span>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Share Food,{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Build Community
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with your neighbors to share excess food, reduce waste, and build a stronger community together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-3"
            >
              Start Sharing Food
              <Heart className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-3 bg-card/90 backdrop-blur-glass border-border/50"
            >
              Find Food Near You
              <Utensils className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-card/90 backdrop-blur-glass border-border/50 shadow-glass">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Donate Food</h3>
              <p className="text-muted-foreground">
                Share your excess food with community members who need it most.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/90 backdrop-blur-glass border-border/50 shadow-glass">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                See instant updates when food is claimed or new donations are posted.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/90 backdrop-blur-glass border-border/50 shadow-glass">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Food</h3>
              <p className="text-muted-foreground">
                Discover available food donations in your neighborhood easily.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
