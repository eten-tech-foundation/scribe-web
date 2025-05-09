import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export function App() {
  return (
    <div className='min-h-screen'>
      <header className='bg-primary px-6 py-4 text-primary-foreground shadow-md'>
        <div className='container mx-auto flex items-center justify-between'>
          <h1 className='text-xl font-bold'>Scibe Web</h1>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        <Outlet />
      </main>

      <footer className='mt-8 bg-secondary px-6 py-4 text-secondary-foreground'>
        <div className='container mx-auto text-center'>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>

      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  );
}
