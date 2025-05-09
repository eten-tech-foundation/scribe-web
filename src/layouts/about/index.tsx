import { Navigation } from '@/routes';
import { Card } from '@/components/ui/card';
import { Counter } from '@/components/counter';
import { useAppStore } from '@/store/store';

export function AboutPage() {
  const { count } = useAppStore();

  return (
    <div className="space-y-8">
      <Navigation />

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">About Page</h1>
        <p className="text-lg text-muted-foreground">
          This is the about page.
        </p>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shared Component &amp; Global State Example</h2>
          <p className="mb-4">Global count from store: {count}</p>
          <Counter initialValue={10} />
        </Card>

      </div>
    </div>
  );
}