// import { useState } from 'react';

// import { Loader2 } from 'lucide-react';
// import { useTranslation } from 'react-i18next';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { useProjectUnitBooks } from '@/hooks/useProjectUnitBooks'; // Adjust path as needed
// import { ViewPageHeader } from '@/layouts/projects/ViewPageHeader';
// import { type Project } from '@/lib/types';
// import { useAppStore } from '@/store/store';

// interface ProjectDetailPageProps {
//   project: Project | undefined;
//   loading?: boolean;
// }

// export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, loading }) => {
//   const { t } = useTranslation();
//   const { userdetail } = useAppStore();

//   const [selectedBook, setSelectedBook] = useState<string>('');

//   // Assuming you have a way to get the project_unit_id, using '1' as example
//   //   const projectUnitId = '6'; // This should come from your project data or props
//   const { data: books, isLoading: booksLoading } = useProjectUnitBooks(
//     project ? project.id.toString() : '0',
//     userdetail?.email ?? ''
//   );

//   const handleAddBook = () => {
//     if (selectedBook) {
//       console.log('Adding book:', selectedBook);
//       // Add your logic here to handle adding the selected book
//       setSelectedBook('');
//     }
//   };

//   if (loading) {
//     return (
//       <div className='flex h-full items-center justify-center'>
//         <div className='flex items-center gap-2'>
//           <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
//           <span className='text-gray-500'>Loading project...</span>
//         </div>
//       </div>
//     );
//   }

//   if (!project) {
//     return (
//       <div className='flex h-full items-center justify-center'>
//         <span className='text-gray-500'>Project not found</span>
//       </div>
//     );
//   }

//   const headerTitle = `${project.targetLanguageName} - ${project.name}`;

//   return (
//     <div className='flex h-full flex-col'>
//       <ViewPageHeader title={headerTitle} />

//       <div className='flex flex-1 gap-6 overflow-hidden'>
//         {/* Project Details Card - 1/3 width */}
//         <div className='w-1/3 flex-shrink-0'>
//           <Card className='h-fit'>
//             <CardContent className='space-y-4 py-2'>
//               <div className='flex justify-between'>
//                 <label className='text-sm font-bold'>Name</label>
//                 <p className='text-sm font-medium text-gray-600'>{project.name}</p>
//               </div>
//               <div className='flex justify-between'>
//                 <label className='text-sm font-bold'>Source Language</label>
//                 <p className='text-sm font-medium text-gray-600'>{project.sourceLanguageName}</p>
//               </div>
//               <div className='flex justify-between'>
//                 <label className='text-sm font-bold'>Target Language</label>
//                 <p className='text-sm font-medium text-gray-600'>{project.targetLanguageName}</p>
//               </div>
//               <div className='flex justify-between'>
//                 <label className='text-sm font-bold'>Source Bible</label>
//                 <p className='text-sm font-medium text-gray-600'>{project.sourceName}</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Table Section - 2/3 width */}

//         <div className='flex h-full flex-col'>
//           {/* Book Selection Section */}
//           <div className='flex-shrink-0 flex-col pt-0.5 pb-4'>
//             <div className='flex items-center gap-3'>
//               <Select value={selectedBook} onValueChange={setSelectedBook}>
//                 <SelectTrigger className='w-[250px]'>
//                   <SelectValue placeholder={booksLoading ? 'Loading books...' : 'Book'} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {books?.map(book => (
//                     <SelectItem key={book.book_id} value={book.book_id.toString()}>
//                       {book.eng_display_name} ({book.code})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Button
//                 className='flex items-center gap-2'
//                 // disabled={!selectedBook || booksLoading}
//                 size='sm'
//                 onClick={handleAddBook}
//               >
//                 Assign
//               </Button>
//             </div>
//           </div>
//           <div className='flex flex-col overflow-auto rounded-lg border border-2 border-[#D9D8D0]'>
//             {/* Table Header */}
//             <div className='flex-shrink-0 rounded-t-lg bg-[#F6F4EE]'>
//               <Table className='table-fixed'>
//                 <TableHeader>
//                   <TableRow className='hover:bg-transparent'>
//                     <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
//                       Book
//                     </TableHead>
//                     <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
//                       Chapter
//                     </TableHead>
//                     <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
//                       Assigned
//                     </TableHead>
//                     <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
//                       Status
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//               </Table>
//             </div>

//             {/* Scrollable Body */}
//             <div className='flex-1 overflow-y-auto'>
//               <Table>
//                 <TableBody className='divide-y divide-[#D9D8D0] bg-white'>
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       data
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       text
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       tezt
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       text{' '}
//                     </TableCell>
//                   </TableRow>{' '}
//                   <TableRow
//                     key={project.id}
//                     className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
//                   >
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       last
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       last
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
//                       last
//                     </TableCell>
//                     <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
//                       last
//                     </TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjectUnitBooks } from '@/hooks/useProjectUnitBooks';
import { useUsers } from '@/hooks/useUsers'; // Import the useUsers hook
import { ViewPageHeader } from '@/layouts/projects/ViewPageHeader';
import { type Project } from '@/lib/types';
import { useAppStore } from '@/store/store';

interface ProjectDetailPageProps {
  project: Project | undefined;
  loading?: boolean;
}

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  role: number;
  status?: string;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, loading }) => {
  const { t } = useTranslation();
  const { userdetail } = useAppStore();

  const [selectedBook, setSelectedBook] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Fetch books
  const { data: books, isLoading: booksLoading } = useProjectUnitBooks(
    project ? project.id.toString() : '0',
    userdetail?.email ?? ''
  );

  // Fetch users
  const { data: users, isLoading: usersLoading } = useUsers(userdetail?.email ?? '');

  const handleAddBook = () => {
    if (selectedBook) {
      setIsDialogOpen(true);
    }
  };

  const handleAssignUser = () => {
    if (selectedUser && selectedBook) {
      console.log('Assigning book:', selectedBook, 'to user:', selectedUser);
      // Add your assignment logic here

      // Reset selections and close dialog
      setSelectedUser('');
      setSelectedBook('');
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser('');
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex items-center gap-2'>
          <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
          <span className='text-gray-500'>Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span className='text-gray-500'>Project not found</span>
      </div>
    );
  }

  const headerTitle = `${project.targetLanguageName} - ${project.name}`;

  return (
    <div className='flex h-full flex-col'>
      <ViewPageHeader title={headerTitle} />

      <div className='flex flex-1 gap-6 overflow-hidden'>
        {/* Project Details Card - 1/3 width */}
        <div className='w-1/3 flex-shrink-0'>
          <Card className='h-fit'>
            <CardContent className='space-y-4 py-2'>
              <div className='flex justify-between'>
                <label className='text-sm font-bold'>Name</label>
                <p className='text-sm font-medium text-gray-600'>{project.name}</p>
              </div>
              <div className='flex justify-between'>
                <label className='text-sm font-bold'>Source Language</label>
                <p className='text-sm font-medium text-gray-600'>{project.sourceLanguageName}</p>
              </div>
              <div className='flex justify-between'>
                <label className='text-sm font-bold'>Target Language</label>
                <p className='text-sm font-medium text-gray-600'>{project.targetLanguageName}</p>
              </div>
              <div className='flex justify-between'>
                <label className='text-sm font-bold'>Source Bible</label>
                <p className='text-sm font-medium text-gray-600'>{project.sourceName}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section - 2/3 width */}
        <div className='flex h-full flex-col'>
          {/* Book Selection Section */}
          <div className='flex-shrink-0 flex-col pb-4'>
            <div className='flex items-center gap-3'>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className='w-[250px]'>
                  <SelectValue placeholder={booksLoading ? 'Loading books...' : 'Book'} />
                </SelectTrigger>
                <SelectContent>
                  {books?.map(book => (
                    <SelectItem key={book.book_id} value={book.book_id.toString()}>
                      {book.eng_display_name} ({book.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className='flex items-center gap-2'
                disabled={!selectedBook || booksLoading}
                size='sm'
                onClick={handleAddBook}
              >
                Assign
              </Button>
            </div>
          </div>

          <div className='flex flex-col overflow-auto rounded-lg border border-2 border-[#D9D8D0]'>
            {/* Table Header */}
            <div className='flex-shrink-0 rounded-t-lg bg-[#F6F4EE]'>
              <Table className='table-fixed'>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-1 px-6'>{/* <Checkbox /> */}</TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Book
                    </TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Chapter
                    </TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Assigned
                    </TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Scrollable Body */}
            <div className='flex-1 overflow-y-auto'>
              <Table>
                <TableBody className='divide-y divide-[#D9D8D0] bg-white'>
                  {/* Your existing table rows */}
                  <TableRow
                    key={project.id}
                    className='align-center cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
                  >
                    <TableCell className='px-6 py-4 text-sm whitespace-nowrap'>
                      <Checkbox />
                    </TableCell>
                    <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                      data
                    </TableCell>
                    <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                      text
                    </TableCell>
                    <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                      tezt
                    </TableCell>
                    <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
                      text
                    </TableCell>
                  </TableRow>
                  {/* Add more rows as needed */}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* User Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Select User</DialogTitle>
          </DialogHeader>

          {/* <div className='space-y-4 py-4'> */}
          {/* <div className='space-y-2'>
              <label className='text-sm font-medium'>Selected Book:</label>
              <p className='text-sm text-gray-600'>
                {books?.find(book => book.book_id.toString() === selectedBook)?.eng_display_name ||
                  'No book selected'}
              </p>
            </div> */}
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className='w-full bg-white'>
              <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a User'} />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user: User) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* </div> */}

          <DialogFooter className='flex gap-2'>
            <Button variant='outline' onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button disabled={!selectedUser || usersLoading} onClick={handleAssignUser}>
              {usersLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
