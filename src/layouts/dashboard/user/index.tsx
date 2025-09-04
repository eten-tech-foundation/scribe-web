import React from 'react';

import { useTranslation } from 'react-i18next';

// Tab components (inline since shadcn/ui tabs might not be available)
const Tabs = ({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string;
  className: string;
  children: React.ReactNode;
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ className, children, activeTab, setActiveTab }: any) => (
  <div className={className}>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeTab, setActiveTab } as any);
      }
      return child;
    })}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => (
  <button
    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === value
        ? 'bg-background text-foreground border-primary border-b-3'
        : 'text-muted-foreground hover:text-foreground'
    }`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, className, children, activeTab }: any) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

// Badge component (inline)
const Badge = ({
  variant = 'default',
  className = '',
  children,
}: {
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
  children: React.ReactNode;
}) => {
  const baseClasses =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'text-foreground border-border',
  };

  return <div className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</div>;
};

// Mock data for current assignments
const myWorkData = [
  {
    id: 1,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 1',
    status: '25/31 verses',
    completedVerses: 25,
    totalVerses: 31,
  },
  {
    id: 2,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 2',
    status: '15/25 verses',
    completedVerses: 15,
    totalVerses: 25,
  },
  {
    id: 3,
    project: 'New Testament Project',
    book: 'Matthew',
    chapter: 'Chapter 5',
    status: '48/48 verses',
    completedVerses: 48,
    totalVerses: 48,
  },
  {
    id: 4,
    project: 'Old Testament Project',
    book: 'Psalms',
    chapter: 'Chapter 23',
    status: '0/6 verses',
    completedVerses: 0,
    totalVerses: 6,
  },
];

// Mock data for completed history
const historyData = [
  {
    id: 1,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 3',
    date: '2024-08-15',
  },
  {
    id: 2,
    project: 'New Testament Project',
    book: 'Matthew',
    chapter: 'Chapter 1',
    date: '2024-08-10',
  },
  {
    id: 3,
    project: 'Bible Translation Project',
    book: 'Exodus',
    chapter: 'Chapter 1',
    date: '2024-08-05',
  },
  {
    id: 4,
    project: 'New Testament Project',
    book: 'Matthew',
    chapter: 'Chapter 2',
    date: '2024-07-28',
  },
  {
    id: 5,
    project: 'Old Testament Project',
    book: 'Psalms',
    chapter: 'Chapter 1',
    date: '2024-07-20',
  },
  {
    id: 6,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 4',
    date: '2024-07-15',
  },
  {
    id: 7,
    project: 'New Testament Project',
    book: 'Matthew',
    chapter: 'Chapter 3',
    date: '2024-07-10',
  },
  {
    id: 8,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 5',
    date: '2024-07-05',
  },
  {
    id: 9,
    project: 'Old Testament Project',
    book: 'Psalms',
    chapter: 'Chapter 2',
    date: '2024-06-30',
  },
  {
    id: 10,
    project: 'New Testament Project',
    book: 'Matthew',
    chapter: 'Chapter 4',
    date: '2024-06-25',
  },
  {
    id: 11,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 6',
    date: '2024-06-20',
  },
  {
    id: 12,
    project: 'Old Testament Project',
    book: 'Psalms',
    chapter: 'Chapter 3',
    date: '2024-06-15',
  },
  {
    id: 13,
    project: 'New Testament Project',
    book: 'Mark',
    chapter: 'Chapter 1',
    date: '2024-06-10',
  },
  {
    id: 14,
    project: 'Bible Translation Project',
    book: 'Genesis',
    chapter: 'Chapter 7',
    date: '2024-06-05',
  },
  {
    id: 15,
    project: 'Old Testament Project',
    book: 'Psalms',
    chapter: 'Chapter 4',
    date: '2024-06-01',
  },
];

// Sort work data: completed verses first, then by book and chapter
const sortedWorkData = [...myWorkData].sort((a, b) => {
  const aCompleted = a.completedVerses === a.totalVerses;
  const bCompleted = b.completedVerses === b.totalVerses;

  if (aCompleted && !bCompleted) return -1;
  if (!aCompleted && bCompleted) return 1;

  if (a.book !== b.book) return a.book.localeCompare(b.book);
  return a.chapter.localeCompare(b.chapter);
});

// Sort history data: most recent first
const sortedHistoryData = [...historyData].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function UserHomePage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      {/* <div className='mx-auto max-w-7xl'> */}
      <div className='mb-8 space-y-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Translator Dashboard</h1>
      </div>

      <Tabs className='w-full' defaultValue='my-work'>
        <TabsList className='mb-6 grid w-1/6 min-w-[300px] grid-cols-2 rounded-lg p-1'>
          <TabsTrigger value='my-work'>My Work ({myWorkData.length})</TabsTrigger>
          <TabsTrigger value='my-history'>My History ({historyData.length})</TabsTrigger>
        </TabsList>

        <TabsContent className='space-y-4' value='my-work'>
          <div className='rounded-lg border bg-white shadow-sm'>
            <div className='max-h-96 overflow-y-auto'>
              <table className='w-full'>
                <thead className='sticky top-0 border-b border-gray-200 bg-white'>
                  <tr>
                    <th className='p-4 text-left font-semibold text-gray-900'>Project</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Book</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Chapter</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWorkData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                        index === sortedWorkData.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className='p-4 font-medium text-gray-900'>{item.project}</td>
                      <td className='p-4 text-gray-700'>{item.book}</td>
                      <td className='p-4 text-gray-700'>{item.chapter}</td>
                      <td className='p-4'>
                        <div className='flex items-center space-x-3'>
                          <span className='text-sm text-gray-600'>{item.status}</span>
                          {item.completedVerses === item.totalVerses && (
                            <Badge className='border-green-200 bg-green-100 text-green-800'>
                              Complete
                            </Badge>
                          )}
                          {item.completedVerses > 0 && item.completedVerses < item.totalVerses && (
                            <Badge className='border-yellow-200 bg-yellow-100 text-yellow-800'>
                              In Progress
                            </Badge>
                          )}
                          {item.completedVerses === 0 && (
                            <Badge className='border-gray-300 text-gray-600' variant='outline'>
                              Not Started
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent className='space-y-4' value='my-history'>
          <div className='rounded-lg border bg-white shadow-sm'>
            <div className='max-h-96 overflow-y-auto'>
              <table className='w-full'>
                <thead className='sticky top-0 border-b border-gray-200 bg-white'>
                  <tr>
                    <th className='p-4 text-left font-semibold text-gray-900'>Project</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Book</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Chapter</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistoryData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                        index === sortedHistoryData.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className='p-4 font-medium text-gray-900'>{item.project}</td>
                      <td className='p-4 text-gray-700'>{item.book}</td>
                      <td className='p-4 text-gray-700'>{item.chapter}</td>
                      <td className='p-4 text-gray-600'>{formatDate(item.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* </div> */}
    </div>
  );
}
