import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, UserCheck, Lightbulb } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Post {
  id: string;
  content: string;
  author_name: string;
  author_title: string;
  author_avatar: string;
  author_verified: boolean;
  likes: number;
  comments: number;
  category: string;
  tags: string[];
  image_url: string | null;
  created_at: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profile_picture: string | null;
  rating: number;
  years_experience: number;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_doctor')
          .eq('id', user.id)
          .single();

        if (profile?.preferred_doctor) {
          const { data: doctor } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', profile.preferred_doctor)
            .single();
          
          setSelectedDoctor(doctor);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load feed posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const { error } = await supabase
        .from('posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const filterPostsByCategory = (category: string) => {
    if (category === 'my-doctor' && selectedDoctor) {
      return posts.filter(post => post.author_name === selectedDoctor.name);
    }
    if (category === 'exercise-tips') {
      return posts.filter(post => 
        post.category === 'exercise_tips' || 
        post.tags?.includes('exercise') ||
        post.tags?.includes('rehabilitation')
      );
    }
    return posts;
  };

  const formatBulletPoints = (content: string) => {
    // Check if content has numbered points
    if (content.includes('1.') || content.includes('2.')) {
      const points = content.split(/\d+\./).filter(point => point.trim());
      return (
        <div className="space-y-2">
          {points.map((point, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm">{point.trim()}</p>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm">{content}</p>;
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback>{post.author_name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{post.author_name}</h3>
              {post.author_verified && (
                <UserCheck className="w-4 h-4 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{post.author_title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {formatBulletPoints(post.content)}
        
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full rounded-lg mt-4 max-h-64 object-cover"
          />
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading your professional feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Professional Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with your healthcare team and expert tips
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="my-doctor">
              My Doctor {selectedDoctor && `(${selectedDoctor.name})`}
            </TabsTrigger>
            <TabsTrigger value="exercise-tips">
              <Lightbulb className="w-4 h-4 mr-2" />
              Exercise Tips
            </TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="my-doctor" className="space-y-6">
            {selectedDoctor ? (
              <>
                <Card className="bg-primary-soft/20 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedDoctor.profile_picture || undefined} />
                        <AvatarFallback>{selectedDoctor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedDoctor.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Heart
                                key={i}
                                className={`w-3 h-3 ${
                                  i < selectedDoctor.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {selectedDoctor.years_experience} years experience
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {filterPostsByCategory('my-doctor').map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No doctor selected yet</p>
                  <Button variant="outline">Select Your Doctor</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exercise-tips" className="space-y-6">
            {filterPostsByCategory('exercise-tips').map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {posts.filter(post => post.category === 'community').map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Feed;