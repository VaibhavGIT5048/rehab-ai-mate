import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Award } from "lucide-react";

const ProgressPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recovery Progress</h1>
          <p className="text-muted-foreground">Track your rehabilitation journey and celebrate milestones</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovery</span>
                  <span className="text-sm font-medium">73%</span>
                </div>
                <Progress value={73} className="h-2" />
                <p className="text-xs text-muted-foreground">23% improvement this month</p>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Completion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Exercise Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground">6 of 7 sessions completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Consistency */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">30-Day Streak</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">28 consecutive days of exercises</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Progress Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Weekly Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Progress chart visualization would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary-soft rounded-lg">
                <Award className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-medium">Week Warrior</h4>
                  <p className="text-sm text-muted-foreground">Completed all exercises this week</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-8 h-8 text-accent" />
                <div>
                  <h4 className="font-medium">Improvement Milestone</h4>
                  <p className="text-sm text-muted-foreground">Reached 70% recovery progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;