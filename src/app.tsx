import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Navigation } from './routes';

export function App() {
  return (
    <div className='min-h-screen'>
      <header className='bg-primary text-primary-foreground px-6 py-4 shadow-md'>
        <div className='container mx-auto flex items-center justify-between'>
          <h1 className='text-xl font-bold'>Scribe Web</h1>
          <Navigation />
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        <Outlet />
      </main>

      <footer className='bg-secondary text-secondary-foreground mt-8 px-6 py-4'>
        <div className='container mx-auto text-center'>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>

      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  );
}
