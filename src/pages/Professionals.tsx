import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Star, MapPin, MessageCircle, Search, Filter } from "lucide-react";

const professionals = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "Physical Therapy",
    experience: "15 years",
    rating: 4.9,
    reviews: 127,
    location: "San Francisco, CA",
    avatar: "SC",
    verified: true,
    languages: ["English", "Mandarin"],
    specializations: ["Sports Injuries", "Post-Surgery Rehab"]
  },
  {
    id: 2,
    name: "Dr. Michael Rodriguez",
    specialty: "Orthopedic Surgery",
    experience: "12 years",
    rating: 4.8,
    reviews: 89,
    location: "Los Angeles, CA",
    avatar: "MR",
    verified: true,
    languages: ["English", "Spanish"],
    specializations: ["Joint Replacement", "Spine Surgery"]
  },
  {
    id: 3,
    name: "Dr. Emily Johnson",
    specialty: "Sports Medicine",
    experience: "8 years",
    rating: 4.9,
    reviews: 156,
    location: "New York, NY",
    avatar: "EJ",
    verified: true,
    languages: ["English"],
    specializations: ["Athletic Recovery", "Injury Prevention"]
  }
];

const Professionals = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Healthcare Professionals</h1>
          <p className="text-muted-foreground">Connect with verified rehabilitation specialists and healthcare experts</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, specialty, or location..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Professionals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-lg">
                      {professional.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{professional.name}</h3>
                      <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                    </div>
                  </div>
                  {professional.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating and Experience */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{professional.rating}</span>
                    <span className="text-sm text-muted-foreground">({professional.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="w-3 h-3" />
                    {professional.experience}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {professional.location}
                </div>

                {/* Specializations */}
                <div>
                  <p className="text-sm font-medium mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {professional.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <p className="text-sm font-medium mb-2">Languages:</p>
                  <p className="text-sm text-muted-foreground">{professional.languages.join(", ")}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">
            Load More Professionals
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Professionals;