import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const BASIC_TOPICS = [
  "Array", "String", "Hash Table", "Math", "Sorting",
  "Two Pointers", "Binary Search", "Sliding Window", "Linked List", "Matrix"
];

const ADVANCED_TOPICS = [
  "Dynamic Programming", "Greedy", "Tree", "Binary Tree", "Depth-First Search", 
  "Breadth-First Search", "Graph", "Backtracking", "Stack", "Queue", 
  "Heap", "Bit Manipulation", "Trie", "Union Find", "Divide and Conquer", 
  "Geometry", "Recursion"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [advancedSelected, setAdvancedSelected] = useState<string[]>([]);
  const [userLevels, setUserLevels] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    BASIC_TOPICS.forEach(t => init[t] = 1);
    return init;
  });
  const [duration, setDuration] = useState<number>(30);
  const [planName, setPlanName] = useState<string>("My Plan");
  const [loading, setLoading] = useState(false);

  const toggleAdvanced = (topic: string) => {
    setAdvancedSelected(prev => {
      const isSelected = prev.includes(topic);
      if (isSelected) {
        const nextLevels = { ...userLevels };
        delete nextLevels[topic];
        setUserLevels(nextLevels);
        return prev.filter(t => t !== topic);
      } else {
        setUserLevels(prevLevels => ({ ...prevLevels, [topic]: 1 }));
        return [...prev, topic];
      }
    });
  };

  const handleGenerate = async () => {
    if (Object.keys(userLevels).length < 10) return;
    const normalizedName = planName.trim() || `Plan ${new Date().toISOString().split("T")[0]}`;
    setLoading(true);
    try {
      const payload = {
        name: normalizedName,
        duration,
        startDate: new Date().toISOString(),
        userLevels
      };
      const { data } = await api.post('/plans/generate', payload);
      localStorage.setItem("planId", data._id);
      navigate(`/plan/${data._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configure Your Core Plan</h1>
        <p className="text-muted-foreground mt-2">10 foundation topics are mandatory. You can add advanced topics to your mix below.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pick Advanced Topics (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {ADVANCED_TOPICS.map(topic => {
            const isSelected = advancedSelected.includes(topic);
            return (
              <Badge 
                key={topic} 
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer text-sm py-1 px-3 hover:scale-105 transition-transform"
                onClick={() => toggleAdvanced(topic)}
              >
                {topic} {isSelected ? "✓" : "+"}
              </Badge>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rate Your Proficiency (1 = Beginner, 5 = Master)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-2 border-b pb-2">Foundation Topics</h3>
            {BASIC_TOPICS.map(topic => (
              <div key={topic} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{topic}</span>
                  <span className="text-xs font-bold bg-secondary px-2 rounded-full py-1 text-primary">Level {userLevels[topic] || 1}</span>
                </div>
                <Slider 
                  min={1} 
                  max={5} 
                  step={1} 
                  value={userLevels[topic] || 1}
                  onChange={(e) => setUserLevels({ ...userLevels, [topic]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>

          {advancedSelected.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-2 border-b pb-2">Advanced Topics</h3>
              {advancedSelected.map(topic => (
                <div key={topic} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{topic}</span>
                    <span className="text-xs font-bold bg-secondary px-2 rounded-full py-1 text-primary">Level {userLevels[topic] || 1}</span>
                  </div>
                  <Slider 
                    min={1} 
                    max={5} 
                    step={1} 
                    value={userLevels[topic] || 1}
                    onChange={(e) => setUserLevels({ ...userLevels, [topic]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            maxLength={80}
            placeholder="My Plan"
            className="font-mono"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{duration} Days</span>
           </div>
           <Slider 
              min={7} 
              max={60} 
              step={1} 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
        </CardContent>
      </Card>

      <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 text-lg">
        {loading ? "Compiling algorithm..." : "Generate My Plan"}
      </Button>
    </div>
  );
}
