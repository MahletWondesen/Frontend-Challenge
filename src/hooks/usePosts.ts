import { useQuery } from '@tanstack/react-query';

export const usePosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: () =>
      fetch('https://jsonplaceholder.typicode.com/posts').then((res) => res.json()),
  });
