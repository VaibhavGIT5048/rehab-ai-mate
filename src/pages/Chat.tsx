import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Heart, Stethoscope } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  professional?: {
    name: string;
    specialty: string;
    avatar: string;
  };
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profile_picture: string | null;
  rating: number;
  years_experience: number;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
    loadConversation();
  }, [selectedDoctorId]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
      
      // Set default doctor if none selected
      if (data && data.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async () => {
    if (!selectedDoctorId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find or create conversation
      let { data: conversation, error } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('doctor_id', selectedDoctorId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            doctor_id: selectedDoctorId,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversation = newConversation;
      }

      if (conversation) {
        setConversationId(conversation.id);
        
        // Load messages
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        const formattedMessages: Message[] = (messages || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender_type === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.created_at),
          professional: msg.sender_type === 'ai' ? {
            name: selectedDoctor?.name || 'Doctor',
            specialty: selectedDoctor?.specialty || 'Healthcare Professional',
            avatar: selectedDoctor?.name?.slice(0, 2) || 'D'
          } : undefined
        }));

        setMessages(formattedMessages);

        // Add welcome message if no messages exist
        if (formattedMessages.length === 0 && selectedDoctor) {
          const welcomeMessage: Message = {
            id: "welcome",
            content: `Hello! I'm ${selectedDoctor.name}, your ${selectedDoctor.specialty} with ${selectedDoctor.years_experience} years of experience. I'm here to help guide your rehabilitation journey. How are you feeling today?`,
            sender: "ai",
            timestamp: new Date(),
            professional: {
              name: selectedDoctor.name,
              specialty: selectedDoctor.specialty,
              avatar: selectedDoctor.name.slice(0, 2)
            }
          };
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDoctorId || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save user message to database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          content: currentMessage,
          sender_type: 'user',
        });

      // Call Hugging Face API via edge function
      const { data, error } = await supabase.functions.invoke('chat-huggingface', {
        body: {
          message: currentMessage,
          doctorId: selectedDoctorId,
          conversationId: conversationId,
        },
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        professional: {
          name: data.doctorName,
          specialty: data.specialty,
          avatar: data.doctorName?.slice(0, 2) || 'D'
        }
      };

      setMessages(prev => [...prev, aiResponse]);

      // Save AI response to database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          sender_type: 'ai',
        });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm having trouble connecting right now. Here's what I recommend in the meantime:

1. Continue with your prescribed exercise routine as directed
2. Apply ice or heat therapy as previously recommended
3. Monitor your symptoms and note any changes
4. Contact me again if symptoms worsen or if you have urgent concerns

Please try reaching out again in a few moments.`,
        sender: "ai",
        timestamp: new Date(),
        professional: {
          name: selectedDoctor?.name || 'Doctor',
          specialty: selectedDoctor?.specialty || 'Healthcare Professional',
          avatar: selectedDoctor?.name?.slice(0, 2) || 'D'
        }
      };
      setMessages(prev => [...prev, fallbackResponse]);

      toast({
        title: "Connection Error",
        description: "Please try again in a moment",
        variant: "destructive",
      });
    }
  };

  const formatBulletPoints = (content: string) => {
    // Check if content has numbered points
    if (content.includes('1.') || content.includes('2.')) {
      const points = content.split(/\d+\./).filter(point => point.trim());
      const intro = points[0]?.trim();
      const bulletPoints = points.slice(1);
      
      return (
        <div className="space-y-3">
          {intro && <p className="text-sm">{intro}</p>}
          <div className="space-y-2">
            {bulletPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm">{point.trim()}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <p className="text-sm">{content}</p>;
  };

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Healthcare Chat</h1>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="w-full max-w-xs">
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
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      AI Healthcare Chat
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently connected with {selectedDoctor?.name || 'Doctor'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-success border-success/20">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    Online
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {message.professional?.avatar || <Bot className="w-4 h-4" />}
                      </div>
                    )}
                    
                  <div
                    className={`max-w-md rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.sender === "ai" && message.professional && (
                      <div className="text-xs text-muted-foreground mb-1">
                        {message.professional.name} • {message.professional.specialty}
                      </div>
                    )}
                    {message.sender === "ai" ? formatBulletPoints(message.content) : <p className="text-sm">{message.content}</p>}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                    
                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about your rehabilitation, exercises, or any concerns..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-0 resize-none"
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Professional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Healthcare Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {selectedDoctor?.name?.slice(0, 2) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedDoctor?.name || 'Doctor'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoctor?.specialty || 'Healthcare Professional'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Heart className="w-3 h-3 text-primary" />
                      <span className="text-xs">{selectedDoctor?.years_experience || 0} years experience</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="medical" size="sm" className="w-full justify-start">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Schedule Assessment
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  View Exercise Plan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bot className="w-4 h-4 mr-2" />
                  Emergency Contact
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-primary-soft rounded-lg">
                    <p className="text-sm font-medium mb-1">Progress Update</p>
                    <p className="text-xs text-muted-foreground">
                      You've improved 23% in mobility this week!
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium mb-1">Recommendation</p>
                    <p className="text-xs text-muted-foreground">
                      Consider adding balance exercises to your routine.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;