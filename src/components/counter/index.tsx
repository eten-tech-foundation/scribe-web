import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/store';

interface CounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);
  const { increment: incrementGlobal } = useAppStore();

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  const decrement = () => {
    setCount((prev) => prev - 1);
  };

  const reset = () => {
    setCount(initialValue);
  };

  const incrementBoth = () => {
    setCount((prev) => prev + 1);
    incrementGlobal();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium">Local count: {count}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={decrement}>Decrement</Button>
        <Button variant="default" onClick={increment}>Increment</Button>
        <Button variant="secondary" onClick={reset}>Reset</Button>
        <Button variant="destructive" onClick={incrementBoth}>Increment Both</Button>
      </div>
    </div>
  );
}