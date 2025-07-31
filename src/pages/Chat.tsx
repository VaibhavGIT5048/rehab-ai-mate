import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Heart, Stethoscope } from "lucide-react";

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

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Dr. Sarah Chen, your AI-enhanced physiotherapist. I'm here to help guide your rehabilitation journey. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
      professional: {
        name: "Dr. Sarah Chen",
        specialty: "Physical Therapy",
        avatar: "SC"
      }
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

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
      // Call Gemini AI
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAgh2fbJkOoS9twWwBUHVUoBOtoBakUYY8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Dr. Sarah Chen, an experienced physiotherapist with 15 years of experience. Respond professionally and empathetically to this patient's message: "${currentMessage}". Provide helpful, medically-informed guidance while maintaining a caring tone. Keep responses concise and actionable.`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your rehabilitation. Could you please share more details about your condition?";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: "ai",
        timestamp: new Date(),
        professional: {
          name: "Dr. Sarah Chen",
          specialty: "Physical Therapy",
          avatar: "SC"
        }
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, remember to follow your prescribed exercise routine and don't hesitate to contact me if you experience any concerning symptoms.",
        sender: "ai",
        timestamp: new Date(),
        professional: {
          name: "Dr. Sarah Chen",
          specialty: "Physical Therapy",
          avatar: "SC"
        }
      };
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      Currently connected with Dr. Sarah Chen
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
                      <p className="text-sm">{message.content}</p>
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
                    SC
                  </div>
                  <div>
                    <h3 className="font-medium">Dr. Sarah Chen</h3>
                    <p className="text-sm text-muted-foreground">Physical Therapist</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Heart className="w-3 h-3 text-primary" />
                      <span className="text-xs">15 years experience</span>
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