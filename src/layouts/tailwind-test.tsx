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
          Tailwind CSS 4 Test Page
        </h1>
        <p className='text-primary-foreground/90 mt-4 text-center text-xl'>
          Testing complex Tailwind CSS features after migration to v4
        </p>
      </section>

      <section className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Card 1 */}
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-xl'>
          <CardHeader className='bg-primary/5 dark:bg-primary/10'>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Test various interactive UI components</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                <Button variant='default'>Default</Button>
                <Button variant='destructive'>Destructive</Button>
                <Button variant='outline'>Outline</Button>
                <Button variant='secondary'>Secondary</Button>
                <Button variant='ghost'>Ghost</Button>
                <Button variant='link'>Link</Button>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Badge>Default</Badge>
                <Badge variant='secondary'>Secondary</Badge>
                <Badge variant='destructive'>Destructive</Badge>
                <Badge variant='outline'>Outline</Badge>
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

        {/* Card 2 */}
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-xl'>
          <CardHeader className='bg-secondary/30 dark:bg-secondary/20'>
            <CardTitle>Layout & Typography</CardTitle>
            <CardDescription>Test various layout and typography features</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-2 rounded-lg border p-2'>
                <div className='bg-primary text-primary-foreground rounded p-4 text-center font-medium'>
                  1
                </div>
                <div className='bg-primary text-primary-foreground rounded p-4 text-center font-medium'>
                  2
                </div>
                <div className='bg-primary text-primary-foreground col-span-2 rounded p-4 text-center font-medium'>
                  3
                </div>
              </div>

              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Typography Scales</h3>
                <p className='text-muted-foreground text-xs'>Extra Small</p>
                <p className='text-muted-foreground text-sm'>Small</p>
                <p className='text-foreground text-base'>Base</p>
                <p className='text-foreground text-lg'>Large</p>
                <p className='text-xl font-medium'>Extra Large</p>
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

        {/* Card 3 */}
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-xl'>
          <CardHeader className='bg-accent/20 dark:bg-accent/10'>
            <CardTitle>Effects & Animations</CardTitle>
            <CardDescription>Test various effects and animations</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-6'>
              <div className='flex justify-center'>
                <div className='bg-primary animate-bounce rounded-full p-4'>
                  <svg
                    className='text-primary-foreground h-6 w-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M19 14l-7 7m0 0l-7-7m7 7V3'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='transition-all duration-300 hover:scale-110'>
                  <div className='from-chart-1 to-chart-2 h-16 rounded-lg bg-gradient-to-r shadow-lg'></div>
                </div>
                <div className='transition-all duration-300 hover:scale-110'>
                  <div className='from-chart-3 to-chart-4 h-16 rounded-lg bg-gradient-to-r shadow-lg'></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className='bg-muted/30 flex justify-between border-t px-6 py-4'>
            <Button size='sm' variant='outline'>
              Reset
            </Button>
            <Button size='sm'>Apply</Button>
          </CardFooter>
        </Card>
      </section>

      <section className='bg-card rounded-lg p-8 shadow-md'>
        <h2 className='text-card-foreground mb-6 text-2xl font-bold'>Color Palette Test</h2>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {['primary', 'secondary', 'accent', 'muted', 'destructive'].map(color => (
            <div key={color} className='overflow-hidden rounded-lg border'>
              <div className={`h-24 bg-${color}`}></div>
              <div className='p-4'>
                <h3 className='font-medium capitalize'>{color}</h3>
                <p className='text-muted-foreground text-sm'>Base color</p>
              </div>
            </div>
          ))}

          {['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map(color => (
            <div key={color} className='overflow-hidden rounded-lg border'>
              <div className={`h-24 bg-${color}`}></div>
              <div className='p-4'>
                <h3 className='font-medium'>{color}</h3>
                <p className='text-muted-foreground text-sm'>Chart color</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='bg-muted/20 space-y-4 rounded-lg border p-8'>
        <h2 className='text-2xl font-bold'>Responsive Behavior</h2>
        <div className='bg-card rounded p-4 shadow-sm'>
          <div className='hidden sm:block md:hidden'>
            <p className='font-bold'>Small Screen (sm)</p>
          </div>
          <div className='hidden md:block lg:hidden'>
            <p className='font-bold'>Medium Screen (md)</p>
          </div>
          <div className='hidden lg:block xl:hidden'>
            <p className='font-bold'>Large Screen (lg)</p>
          </div>
          <div className='hidden xl:block 2xl:hidden'>
            <p className='font-bold'>Extra Large Screen (xl)</p>
          </div>
          <div className='hidden 2xl:block'>
            <p className='font-bold'>2X Large Screen (2xl)</p>
          </div>
          <div className='block sm:hidden'>
            <p className='font-bold'>Mobile Screen</p>
          </div>
          <p className='text-muted-foreground mt-2 text-sm'>
            Resize your browser to see the changes
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {[1, 2, 3, 4].map(item => (
            <div key={item} className='bg-card rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium'>Item {item}</h3>
              <p className='text-muted-foreground text-sm'>
                This item will reflow based on screen size
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
