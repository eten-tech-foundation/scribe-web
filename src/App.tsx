import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Scibe Web</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-secondary text-secondary-foreground py-4 px-6 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
      
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  );
}