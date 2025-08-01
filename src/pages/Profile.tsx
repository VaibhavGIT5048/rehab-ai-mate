import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Edit, Camera, Star, Calendar, MapPin, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  name: string;
  age: number | null;
  location: string | null;
  injury_type: string | null;
  recovery_goals: string[] | null;
  preferred_doctor: string | null;
  avatar_url: string | null;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profile_picture: string | null;
  rating: number;
  years_experience: number;
}

interface Review {
  id: string;
  doctor_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchDoctors();
    fetchReviews();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile(data);
          setEditedProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('doctor_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...editedProfile,
          id: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAddReview = async () => {
    if (!profile?.preferred_doctor || !newReview.text.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('doctor_reviews')
        .insert({
          user_id: user.id,
          doctor_id: profile.preferred_doctor,
          rating: newReview.rating,
          review_text: newReview.text,
        });

      if (error) throw error;

      setNewReview({ rating: 5, text: "" });
      fetchReviews();
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    } catch (error) {
      console.error('Error adding review:', error);
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to profile-pictures bucket
      const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const updatedProfile = { ...profile, avatar_url: publicUrl };
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const selectedDoctor = doctors.find(d => d.id === profile?.preferred_doctor);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your rehabilitation journey and healthcare preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="doctor">My Doctor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setEditedProfile(profile);
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {profile?.name?.slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute -bottom-2 -right-2">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Camera className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile?.name || "User"}</h3>
                    {profile?.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedProfile?.name || ""}
                        onChange={(e) => setEditedProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile?.name || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={editedProfile?.age || ""}
                        onChange={(e) => setEditedProfile(prev => prev ? { ...prev, age: parseInt(e.target.value) || null } : null)}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile?.age || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editedProfile?.location || ""}
                        onChange={(e) => setEditedProfile(prev => prev ? { ...prev, location: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile?.location || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="injury">Injury Type</Label>
                    {isEditing ? (
                      <Input
                        id="injury"
                        value={editedProfile?.injury_type || ""}
                        onChange={(e) => setEditedProfile(prev => prev ? { ...prev, injury_type: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile?.injury_type || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Recovery Goals</Label>
                  {isEditing ? (
                    <Textarea
                      id="goals"
                      placeholder="Enter your recovery goals (comma-separated)"
                      value={editedProfile?.recovery_goals?.join(", ") || ""}
                      onChange={(e) => setEditedProfile(prev => prev ? { 
                        ...prev, 
                        recovery_goals: e.target.value.split(",").map(g => g.trim()).filter(g => g) 
                      } : null)}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.recovery_goals?.map((goal, index) => (
                        <Badge key={index} variant="outline">{goal}</Badge>
                      )) || <p className="text-sm text-muted-foreground">No goals set</p>}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctor">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Doctor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedDoctor ? (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedDoctor.profile_picture || undefined} />
                      <AvatarFallback>{selectedDoctor.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < selectedDoctor.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {selectedDoctor.years_experience} years experience
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No doctor assigned</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="doctor-select">Change Doctor</Label>
                  <Select
                    value={profile?.preferred_doctor || ""}
                    onValueChange={(value) => {
                      if (profile) {
                        const updatedProfile = { ...profile, preferred_doctor: value };
                        setProfile(updatedProfile);
                        // Auto-save doctor selection
                        supabase.from('profiles')
                          .update({ preferred_doctor: value })
                          .eq('id', profile.id)
                          .then(() => {
                            toast({
                              title: "Success",
                              description: "Doctor updated successfully",
                            });
                          });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Add New Review */}
              {selectedDoctor && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Review for {selectedDoctor.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                            className="p-1"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                rating <= newReview.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="review-text">Review</Label>
                      <Textarea
                        id="review-text"
                        placeholder="Share your experience with this doctor..."
                        value={newReview.text}
                        onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                      />
                    </div>
                    
                    <Button onClick={handleAddReview} disabled={!newReview.text.trim()}>
                      Add Review
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    My Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => {
                        const doctor = doctors.find(d => d.id === review.doctor_id);
                        return (
                          <div key={review.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{doctor?.name}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.review_text}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No reviews yet. Add your first review above!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;