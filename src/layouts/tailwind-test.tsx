import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function TailwindTestPage() {
  return (
    <div className='space-y-8'>
      <section className='from-primary/50 to-accent/50 rounded-lg bg-gradient-to-br p-8 shadow-lg'>
        <h1 className='text-primary-foreground text-center text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl'>
          TailwindCSS 4 Test Page
        </h1>
        <p className='text-primary-foreground/90 mt-4 text-center text-xl'>
          Displaying available styles from the Scribe theme
        </p>
      </section>

      <section className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Card 1 - Theme Colors */}
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-md'>
          <CardHeader className='bg-primary/5 dark:bg-primary/10'>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>Primary color palette</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-2'>
                <div className='bg-background text-foreground rounded border p-3'>
                  background / foreground
                </div>
                <div className='bg-card text-card-foreground rounded border p-3'>
                  card / card-foreground
                </div>
                <div className='bg-popover text-popover-foreground rounded border p-3'>
                  popover / popover-foreground
                </div>
                <div className='bg-primary text-primary-foreground rounded border p-3'>
                  primary / primary-foreground
                </div>
                <div className='bg-secondary text-secondary-foreground rounded border p-3'>
                  secondary / secondary-foreground
                </div>
                <div className='bg-accent text-accent-foreground rounded border p-3'>
                  accent / accent-foreground
                </div>
                <div className='bg-muted text-muted-foreground rounded border p-3'>
                  muted / muted-foreground
                </div>
                <div className='bg-destructive text-destructive-foreground rounded border p-3'>
                  destructive / destructive-foreground
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className='bg-muted/30 flex justify-between border-t px-6 py-4'>
            <Button size='sm' variant='outline'>
              Cancel
            </Button>
            <Button size='sm'>Save</Button>
          </CardFooter>
        </Card>

        {/* Card 2 - UI Components */}
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-md'>
          <CardHeader className='bg-secondary/30 dark:bg-secondary/20'>
            <CardTitle>UI Components</CardTitle>
            <CardDescription>Buttons and badges with theme colors</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-6'>
              <div>
                <h3 className='mb-2 font-medium'>Buttons</h3>
                <div className='flex flex-wrap gap-2'>
                  <Button variant='default'>Default</Button>
                  <Button variant='destructive'>Destructive</Button>
                  <Button variant='outline'>Outline</Button>
                  <Button variant='secondary'>Secondary</Button>
                  <Button variant='ghost'>Ghost</Button>
                  <Button variant='link'>Link</Button>
                </div>
              </div>

              <div>
                <h3 className='mb-2 font-medium'>Badges</h3>
                <div className='flex flex-wrap gap-2'>
                  <Badge>Default</Badge>
                  <Badge variant='secondary'>Secondary</Badge>
                  <Badge variant='destructive'>Destructive</Badge>
                  <Badge variant='outline'>Outline</Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className='bg-muted/30 flex justify-between border-t px-6 py-4'>
            <Button size='sm' variant='outline'>
              Previous
            </Button>
            <Button size='sm'>Next</Button>
          </CardFooter>
        </Card>
      </section>

      <section className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Typography and Radius */}
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle>Typography & Border Radius</CardTitle>
            <CardDescription>Font families and border radius variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div>
                <h3 className='mb-2 font-medium'>Font Families</h3>
                <div className='space-y-2'>
                  <p className='font-sans'>Sans: Geist (--font-sans)</p>
                  <p className='font-serif'>Serif: Geist (--font-serif)</p>
                  <p className='font-mono'>Mono: Geist Mono (--font-mono)</p>
                </div>
              </div>

              <div>
                <h3 className='mb-2 font-medium'>Border Radius</h3>
                <div className='grid grid-cols-4 gap-2'>
                  <div className='bg-muted flex h-16 items-center justify-center rounded-sm'>
                    sm
                  </div>
                  <div className='bg-muted flex h-16 items-center justify-center rounded-md'>
                    md
                  </div>
                  <div className='bg-muted flex h-16 items-center justify-center rounded-lg'>
                    lg
                  </div>
                  <div className='bg-muted flex h-16 items-center justify-center rounded-xl'>
                    xl
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shadows */}
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle>Shadows</CardTitle>
            <CardDescription>Shadow variables from smallest to largest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-2xs'>
                shadow-2xs
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-xs'>
                shadow-xs
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-sm'>
                shadow-sm
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow'>
                shadow
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-md'>
                shadow-md
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-lg'>
                shadow-lg
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-xl'>
                shadow-xl
              </div>
              <div className='bg-card flex h-20 items-center justify-center rounded p-4 shadow-2xl'>
                shadow-2xl
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='bg-card rounded-lg p-8 shadow-md'>
        <h2 className='text-card-foreground mb-6 text-2xl font-bold'>Animations</h2>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          <div>
            <h3 className='mb-4 text-center text-lg font-medium'>Accordion Down</h3>
            <div className='rounded border p-4'>
              <details className='group'>
                <summary className='bg-muted hover:bg-muted/80 flex cursor-pointer items-center justify-between rounded-lg px-4 py-2'>
                  <span>Click to expand (animate down)</span>
                  <svg
                    className='h-5 w-5 transition-transform group-open:rotate-180'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      d='M19 9l-7 7-7-7'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                    />
                  </svg>
                </summary>
                <div className='animate-accordion-down bg-muted/50 mt-2 rounded-md p-4'>
                  <p>This content animates down when opened.</p>
                  <p className='mt-2'>The animation uses the accordion-down keyframes.</p>
                </div>
              </details>
            </div>
          </div>

          <div>
            <h3 className='mb-4 text-center text-lg font-medium'>Accordion Up</h3>
            <div className='rounded border p-4'>
              <details className='group open:animate-accordion-up'>
                <summary className='bg-muted hover:bg-muted/80 flex cursor-pointer items-center justify-between rounded-lg px-4 py-2'>
                  <span>Click to collapse (animate up)</span>
                  <svg
                    className='h-5 w-5 rotate-180 transition-transform group-open:rotate-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      d='M19 9l-7 7-7-7'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                    />
                  </svg>
                </summary>
                <div className='bg-muted/50 mt-2 rounded-md p-4'>
                  <p>This content animates up when closed.</p>
                  <p className='mt-2'>The animation uses the accordion-up keyframes.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className='bg-muted/20 space-y-4 rounded-lg border p-8'>
        <h2 className='text-2xl font-bold'>Dark Mode Comparison</h2>
        <p className='text-muted-foreground'>
          Toggle your system/browser dark mode to see the changes
        </p>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='bg-card rounded-lg p-6 shadow-sm'>
            <h3 className='text-lg font-medium'>Light Mode</h3>
            <p className='text-muted-foreground text-sm'>Uses light theme variables</p>
            <div className='mt-4 flex gap-2'>
              <div className='bg-primary h-8 w-8 rounded'></div>
              <div className='bg-secondary h-8 w-8 rounded'></div>
              <div className='bg-accent h-8 w-8 rounded'></div>
            </div>
          </div>
          <div className='dark rounded-lg p-6 shadow-sm'>
            <div className='bg-card rounded-lg p-6'>
              <h3 className='text-lg font-medium'>Dark Mode (Preview)</h3>
              <p className='text-muted-foreground text-sm'>Uses dark theme variables</p>
              <div className='mt-4 flex gap-2'>
                <div className='bg-primary h-8 w-8 rounded'></div>
                <div className='bg-secondary h-8 w-8 rounded'></div>
                <div className='bg-accent h-8 w-8 rounded'></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
