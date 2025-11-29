import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface GradedRankingProps {
  onGrade: (rank: number) => void;
}

const scales = [
  { name: '3-Point', points: 3 },
  { name: '5-Point', points: 5 },
  { name: '7-Point', points: 7 },
];

export function GradedRanking({ onGrade }: GradedRankingProps) {
  return (
    <div className="p-4">
      <h4 className="font-medium text-center mb-4">Select a Grade</h4>
      <Tabs defaultValue="5-Point" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {scales.map(scale => (
            <TabsTrigger key={scale.name} value={scale.name}>{scale.name}</TabsTrigger>
          ))}
        </TabsList>
        {scales.map(scale => (
          <TabsContent key={scale.name} value={scale.name}>
            <div className="grid mt-4 gap-2" style={{ gridTemplateColumns: `repeat(${scale.points}, minmax(0, 1fr))` }}>
              {Array.from({ length: scale.points }, (_, i) => i + 1).map(point => (
                <Button key={point} variant="outline" size="icon" onClick={() => onGrade(point)}>
                  {point}
                </Button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
