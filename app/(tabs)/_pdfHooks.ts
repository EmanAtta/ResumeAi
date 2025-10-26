/**
 * PDF Hooks
 * Custom React Query hooks for PDF data fetching and management
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPdfs, PdfResponse, PdfItem } from './_pdfServices';

/**
 * Hook to fetch all PDFs with pagination
 * @param page - Page number (default: 1)
 * @param pageSize - Number of items per page (default: 9)
 * @returns Query result with PDF data
 */
export const usePdfs = (
  page: number = 1,
  pageSize: number = 9
): UseQueryResult<PdfResponse, Error> => {
  return useQuery({
    queryKey: ['pdfs', page, pageSize],
    queryFn: () => getPdfs(page, pageSize),
    staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to prefetch next page of PDFs
 * Useful for implementing pagination
 */
export const usePrefetchPdfs = () => {
  const { data } = usePdfs();

  // You can use queryClient.prefetchQuery here if needed
  // This is a placeholder for future implementation

  return data;
};
