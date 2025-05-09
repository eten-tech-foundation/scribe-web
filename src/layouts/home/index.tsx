import { Navigation } from '@/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/counter';
import { useAppStore } from '@/store/store';
import { Calendar } from '@/components/ui/calendar';

export function HomePage() {
  const { count, increment } = useAppStore();

  return (
    <div className="space-y-8">
      <Navigation />

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Home Page</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the Scribe-web
        </p>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shared Counter Component Example</h2>
          <div className="space-y-4">
            <p>Global state count: {count}</p>
            <Button onClick={increment}>Increment Global Count</Button>
            <Counter initialValue={5} />
          </div>
          <Calendar />
        </Card>
      </div>
    </div>
  );
}