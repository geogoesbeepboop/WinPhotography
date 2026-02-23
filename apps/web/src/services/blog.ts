import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';

export const blogKeys = {
  all: ['blog'] as const,
  published: () => [...blogKeys.all, 'published'] as const,
  adminList: () => [...blogKeys.all, 'admin-list'] as const,
  bySlug: (slug: string) => [...blogKeys.all, 'slug', slug] as const,
};

// Mock blog data for fallback
const mockBlogPosts = [
  {
    id: "mock-1",
    slug: "planning-your-pacific-northwest-elopement",
    title: "A Complete Guide to Planning Your Pacific Northwest Elopement",
    excerpt: "From permits and seasons to the most breathtaking locations, everything you need to plan your dream PNW elopement.",
    coverImageUrl: "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Elopements",
    readTime: "8 min read",
    publishedAt: "2026-02-10T00:00:00Z",
    isPublished: true,
    content: "The Pacific Northwest is one of the most breathtaking places on Earth to say your vows...\n\nWhen planning a PNW elopement, timing is everything. The summer months (July-September) offer the most reliable weather, but don't discount the moody beauty of fall and spring.\n\nSome of our favorite locations include Mt. Hood, the Oregon Coast, and the Columbia River Gorge.\n\nPermits are required for most national forest and park locations. Plan ahead — some popular spots book months in advance.\n\nWhat to wear? Layers are your best friend in the Pacific Northwest. The weather can change quickly, so be prepared for sun, rain, and everything in between.\n\nReady to start planning? I'd love to help you find the perfect location for your elopement.",
  },
  {
    id: "mock-2",
    slug: "what-to-wear-engagement-session",
    title: "What to Wear to Your Engagement Session",
    excerpt: "Tips for choosing outfits that photograph beautifully and feel authentically you.",
    coverImageUrl: "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Tips & Advice",
    readTime: "5 min read",
    publishedAt: "2026-01-28T00:00:00Z",
    isPublished: true,
    content: "Your engagement session is one of the first times you'll be professionally photographed as a couple. Here's how to make the most of it.\n\nCoordinate, don't match. Choose complementary colors rather than identical outfits.\n\nConsider your location. A beach session calls for something different than a downtown city shoot.\n\nBring a second outfit. A change of clothes can give your gallery variety and a fresh energy.\n\nAvoid busy patterns and logos. Solid colors and subtle textures photograph best.",
  },
  {
    id: "mock-3",
    slug: "golden-hour-photography-tips",
    title: "Golden Hour Photography: Why Timing Is Everything",
    excerpt: "Understanding the magic of golden hour and how it transforms your photos.",
    coverImageUrl: "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Photography",
    readTime: "4 min read",
    publishedAt: "2026-01-15T00:00:00Z",
    isPublished: true,
    content: "Golden hour — that magical window of warm, soft light just after sunrise and before sunset — is a photographer's best friend.\n\nDuring golden hour, the sun sits low on the horizon, casting long shadows and bathing everything in a warm, golden glow.\n\nFor the most flattering portraits, I always recommend scheduling your session during this time.\n\nThe exact timing varies by season and location, but generally you'll want to plan for the hour before sunset.",
  },
  {
    id: "mock-4",
    slug: "wedding-timeline-guide",
    title: "The Ultimate Wedding Day Timeline Guide",
    excerpt: "How to plan your wedding day schedule for stress-free, stunning photos.",
    coverImageUrl: "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "Weddings",
    readTime: "6 min read",
    publishedAt: "2025-12-30T00:00:00Z",
    isPublished: true,
    content: "A well-planned timeline is the secret to a relaxed wedding day and gorgeous photos.\n\nStart by working backwards from your ceremony time. Allow at least 2 hours for getting ready, 30 minutes for first look photos, and 1 hour for bridal party and family portraits.\n\nDon't forget to build in buffer time. Things will inevitably run a few minutes behind, and that's okay.\n\nCoordinate with your vendors early. Your photographer, coordinator, and venue should all be on the same page.",
  },
];

// Public: published posts only
export function useBlogPosts() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...blogKeys.published(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockBlogPosts;
      const { data } = await apiClient.get('/blog');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Public: single post by slug
export function useBlogPost(slug: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...blogKeys.bySlug(slug), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockBlogPosts.find((p) => p.slug === slug) ?? null;
      const { data } = await apiClient.get(`/blog/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

// Admin: all posts including drafts
export function useAdminBlogPosts() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...blogKeys.adminList(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockBlogPosts;
      const { data } = await apiClient.get('/blog/admin/all');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/blog', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/blog/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}
