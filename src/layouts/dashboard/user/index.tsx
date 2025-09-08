import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

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

// Types
interface ProjectItem {
  project_name: string;
  project_unit_id: number;
  book_id: number;
  book: string;
  chapter_number: number;
  progress: string;
  is_submitted: boolean;
  submitted_time: string | null;
}

interface WorkItem {
  id: string;
  project: string;
  book: string;
  chapter: string;
  status: string;
  completedVerses: number;
  totalVerses: number;
}

interface HistoryItem {
  id: string;
  project: string;
  book: string;
  chapter: number;
  date: string;
}

const fetchProjectData = async (email: string): Promise<ProjectItem[]> => {
  const response = await fetch(`http://localhost:9999/chapter-assignments/user/${email}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project data');
  }
  return response.json();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function UserHomePage(): JSX.Element {
  const { t } = useTranslation();
  const [projectData, setProjectData] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // You can make this dynamic based on logged-in user
  const userEmail = '';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchProjectData(userEmail);
        setProjectData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userEmail]);

  // Process data for My Work (not submitted)
  const myWorkData: WorkItem[] = projectData
    .filter(item => !item.is_submitted)
    .map(item => {
      const [completed, total] = item.progress.split(' of ').map(Number);
      return {
        id: `${item.project_unit_id}-${item.book_id}-${item.chapter_number}`,
        project: item.project_name,
        book: item.book,
        chapter: item.chapter_number.toString(),
        status: item.progress,
        completedVerses: completed,
        totalVerses: total,
      };
    });

  // Process data for History (submitted)
  const historyData: HistoryItem[] = projectData
    .filter(item => item.is_submitted && item.submitted_time)
    .map(item => ({
      id: `${item.project_unit_id}-${item.book_id}-${item.chapter_number}`,
      project: item.project_name,
      book: item.book,
      chapter: item.chapter_number,
      date: item.submitted_time!,
    }));

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

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-lg text-gray-600'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-lg text-red-600'>Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
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
                <thead className='bg-card sticky top-0 border-b border-gray-200'>
                  <tr>
                    <th className='p-4 text-left font-semibold text-gray-900'>Project</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Book</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Chapter</th>
                    <th className='p-4 text-left font-semibold text-gray-900'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWorkData.length === 0 ? (
                    <tr>
                      <td className='p-8 text-center text-gray-500' colSpan={4}>
                        No work items found
                      </td>
                    </tr>
                  ) : (
                    sortedWorkData.map((item, index) => (
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
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  {sortedHistoryData.length === 0 ? (
                    <tr>
                      <td className='p-8 text-center text-gray-500' colSpan={4}>
                        No history items found
                      </td>
                    </tr>
                  ) : (
                    sortedHistoryData.map((item, index) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
