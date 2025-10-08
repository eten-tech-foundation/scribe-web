import { useEffect, useMemo, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Book {
  bookId: number;
  engDisplayName: string;
  code: string;
  completedChapters: number;
  totalChapters: number;
}

interface ExportProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  books: Book[];
  isLoading?: boolean;
  onExport: (selectedBookIds: number[]) => Promise<void>;
}

export const ExportProjectDialog: React.FC<ExportProjectDialogProps> = ({
  isOpen,
  onClose,
  books,
  isLoading = false,
  onExport,
}) => {
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen && books.length > 0) {
      setSelectedBooks(books.map(book => book.bookId));
    }
  }, [isOpen, books]);

  const isAllSelected = useMemo(() => {
    return books.length > 0 && selectedBooks.length === books.length;
  }, [books.length, selectedBooks.length]);

  const isIndeterminate = useMemo(() => {
    return selectedBooks.length > 0 && selectedBooks.length < books.length;
  }, [selectedBooks.length, books.length]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBooks(books.map(book => book.bookId));
    } else {
      setSelectedBooks([]);
    }
  };

  const handleBookSelection = (bookId: number, checked: boolean) => {
    setSelectedBooks(prev => (checked ? [...prev, bookId] : prev.filter(id => id !== bookId)));
  };

  const handleExport = async () => {
    if (selectedBooks.length === 0) return;

    try {
      setIsExporting(true);
      await onExport(selectedBooks);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setSelectedBooks([]);
      onClose();
    }
  };

  const formatProgress = (completed: number, total: number) => {
    return `${completed} of ${total}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[80vh] flex-col sm:max-w-2xl'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='flex items-center justify-between'>Export Project</DialogTitle>
        </DialogHeader>

        <div className='flex flex-1 flex-col overflow-hidden'>
          {isLoading ? (
            <div className='flex items-center justify-center gap-2 py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
              <span className='text-gray-500'>Loading books...</span>
            </div>
          ) : books.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <span className='text-gray-500'>No books found in this project</span>
            </div>
          ) : (
            <>
              <div className='bg-background flex-1 overflow-hidden rounded-lg border'>
                <div className='h-full max-h-[50vh] overflow-y-auto'>
                  <Table>
                    <TableHeader className='sticky top-0 z-10'>
                      <TableRow>
                        <TableHead className='w-12 px-4 py-3'>
                          <Checkbox
                            checked={isAllSelected}
                            className={
                              isIndeterminate
                                ? 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground [&>svg]:opacity-50'
                                : ''
                            }
                            disabled={isExporting}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className='px-4 py-3 text-left text-sm font-semibold'>
                          Book Name
                        </TableHead>
                        <TableHead className='px-4 py-3 text-left text-sm font-semibold'>
                          Completed Chapters
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map(book => (
                        <TableRow
                          key={book.bookId}
                          className='hover cursor-pointer'
                          onClick={() => {
                            if (!isExporting) {
                              const isSelected = selectedBooks.includes(book.bookId);
                              handleBookSelection(book.bookId, !isSelected);
                            }
                          }}
                        >
                          <TableCell className='w-12 px-4 py-3'>
                            <Checkbox
                              checked={selectedBooks.includes(book.bookId)}
                              disabled={isExporting}
                              onCheckedChange={checked =>
                                handleBookSelection(book.bookId, !!checked)
                              }
                              onClick={e => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className='px-4 py-3 text-sm'>
                            <div className='font-medium'>{book.engDisplayName}</div>
                          </TableCell>
                          <TableCell className='px-4 py-3 text-sm'>
                            {formatProgress(book.completedChapters, book.totalChapters)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className='flex flex-shrink-0 justify-end gap-2 pt-4'>
          <Button
            className='min-w-[100px]'
            disabled={selectedBooks.length === 0 || isExporting || isLoading}
            onClick={handleExport}
          >
            {isExporting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Exporting...
              </>
            ) : (
              <>Export</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
