import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Target, 
  Timer, 
  TrendingUp,
  CheckCircle 
} from "lucide-react";

const Exercises = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentReps, setCurrentReps] = useState(12);
  const targetReps = 15;

  const exercises = [
    {
      id: 1,
      name: "Shoulder Flexion",
      description: "Gentle shoulder forward movement to improve range of motion",
      duration: "3 sets × 15 reps",
      difficulty: "Beginner",
      status: "completed",
      accuracy: 95
    },
    {
      id: 2,
      name: "Knee Extension",
      description: "Seated leg extension for quadriceps strengthening",
      duration: "3 sets × 12 reps",
      difficulty: "Intermediate", 
      status: "active",
      accuracy: 88
    },
    {
      id: 3,
      name: "Balance Training",
      description: "Single leg stance with support for balance improvement",
      duration: "3 sets × 30 sec",
      difficulty: "Beginner",
      status: "pending",
      accuracy: 0
    }
  ];

  const stats = [
    { label: "Completed Today", value: "2/3", icon: CheckCircle },
    { label: "Current Streak", value: "7 days", icon: TrendingUp },
    { label: "Weekly Goal", value: "85%", icon: Target },
    { label: "Avg Accuracy", value: "91%", icon: Camera }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Exercise Tracking</h1>
          <p className="text-muted-foreground">
            AI-powered form analysis to ensure proper technique and track your progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Exercise View */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Active Exercise</CardTitle>
                    <p className="text-muted-foreground">Knee Extension - Set 2 of 3</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/20">
                    Intermediate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Camera Feed Placeholder */}
                <div className="relative bg-muted rounded-lg mb-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Camera feed will appear here</p>
                    <p className="text-sm text-muted-foreground">AI tracking your form in real-time</p>
                  </div>
                  
                  {/* Tracking Indicators */}
                  {isTracking && (
                    <>
                      <div className="absolute top-4 left-4 bg-success text-success-foreground px-2 py-1 rounded text-xs font-medium">
                        AI Tracking Active
                      </div>
                      <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-2">
                        <div className="text-xs text-muted-foreground">Form Accuracy</div>
                        <div className="text-lg font-bold text-success">88%</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Exercise Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{currentReps}</div>
                      <div className="text-sm text-muted-foreground">Current Reps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{targetReps}</div>
                      <div className="text-sm text-muted-foreground">Target Reps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">88%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <Progress value={(currentReps / targetReps) * 100} className="h-2" />

                  <div className="flex justify-center gap-4">
                    <Button
                      variant={isTracking ? "destructive" : "hero"}
                      onClick={() => setIsTracking(!isTracking)}
                      className="px-8"
                    >
                      {isTracking ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Exercise
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" onClick={() => setCurrentReps(0)}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      Sit on the edge of a chair with your back straight. Position the camera 
                      to capture your full leg movement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Movement</h4>
                    <p className="text-sm text-muted-foreground">
                      Slowly extend your affected leg until straight, hold for 2 seconds, 
                      then lower slowly. Keep your thigh on the chair throughout.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary-soft rounded-lg">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      Focus on smooth, controlled movements for best results
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercise List Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Today's Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        exercise.status === "active"
                          ? "border-primary bg-primary-soft"
                          : exercise.status === "completed"
                          ? "border-success bg-success/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{exercise.name}</h4>
                        {exercise.status === "completed" && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                        {exercise.status === "active" && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {exercise.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{exercise.duration}</span>
                        {exercise.accuracy > 0 && (
                          <span className="text-primary font-medium">
                            {exercise.accuracy}% accuracy
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="medical" className="w-full mt-4">
                  <Timer className="w-4 h-4 mr-2" />
                  Schedule Next Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exercises;