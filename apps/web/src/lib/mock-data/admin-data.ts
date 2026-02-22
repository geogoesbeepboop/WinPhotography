// Shared mock data for admin dashboard

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  tier: string;
  date: string;
  message: string;
  status: "new" | "responded" | "booked" | "archived";
  createdAt: string;
  preferredDate?: string;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  contractSigned: boolean;
  totalAmount: number;
  paidAmount: number;
  payments: Payment[];
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  clientName: string;
  type: "deposit" | "final" | "addon";
  label: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "refunded";
  date?: string;
  dueDate?: string;
}

export interface Gallery {
  id: string;
  bookingId: string;
  clientName: string;
  title: string;
  status: "draft" | "published";
  photoCount: number;
  createdAt: string;
  publishedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  imageCount: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  totalSpent: number;
  lastBooking: string;
  status: "active" | "past";
  joinedAt: string;
}

export const mockInquiries: Inquiry[] = [
  { id: "inq-1", name: "Emily Rodriguez", email: "emily@example.com", phone: "(415) 555-0198", category: "Weddings", tier: "Signature", date: "Feb 20, 2026", message: "We're getting married in September and would love to chat about your signature package. Our venue is in Napa Valley.", status: "new", createdAt: "Feb 20, 2026", preferredDate: "Sep 12, 2026" },
  { id: "inq-2", name: "David Kim", email: "david@example.com", phone: "(415) 555-0234", category: "Proposals", tier: "The Story", date: "Feb 18, 2026", message: "Planning to propose to my girlfriend at Crissy Field during sunset. Need someone to capture it candidly!", status: "new", createdAt: "Feb 18, 2026", preferredDate: "Mar 15, 2026" },
  { id: "inq-3", name: "Aisha Patel", email: "aisha@example.com", phone: "(510) 555-0171", category: "Headshots", tier: "Professional", date: "Feb 15, 2026", message: "I need updated headshots for my LinkedIn and new company website. Flexible on dates.", status: "responded", createdAt: "Feb 15, 2026", preferredDate: "Mar 2026" },
  { id: "inq-4", name: "James & Lisa Wong", email: "jwong@example.com", phone: "(415) 555-0305", category: "Elopements", tier: "Adventure", date: "Feb 10, 2026", message: "We want to elope on a hike in Big Sur! Thinking a 4-5 hour adventure.", status: "booked", createdAt: "Feb 10, 2026", preferredDate: "Jun 5, 2026" },
  { id: "inq-5", name: "TechCo Events", email: "events@techco.com", phone: "(415) 555-0400", category: "Events", tier: "Full Event", date: "Feb 8, 2026", message: "Annual company gala, 300 guests, need 5 hours of coverage.", status: "archived", createdAt: "Feb 8, 2026", preferredDate: "May 20, 2026" },
  { id: "inq-6", name: "Maya Johnson", email: "maya@example.com", phone: "(650) 555-0122", category: "Graduations", tier: "Milestone", date: "Feb 22, 2026", message: "Graduating from Stanford in June! Would love campus photos.", status: "new", createdAt: "Feb 22, 2026", preferredDate: "Jun 15, 2026" },
];

export const mockBookings: Booking[] = [
  { id: "bk-1", clientId: "c-1", clientName: "Sarah Chen", clientEmail: "sarah@example.com", type: "Wedding - Signature", category: "Weddings", date: "Mar 22, 2026", time: "2:00 PM", location: "Golden Gate Park, SF", status: "confirmed", contractSigned: true, totalAmount: 6800, paidAmount: 2040, payments: [{ id: "pay-1", bookingId: "bk-1", clientName: "Sarah Chen", type: "deposit", label: "Deposit (30%)", amount: 2040, status: "paid", date: "Nov 15, 2025" }, { id: "pay-2", bookingId: "bk-1", clientName: "Sarah Chen", type: "final", label: "Final Balance", amount: 4760, status: "pending", dueDate: "Mar 8, 2026" }], notes: "Bride prefers candid over posed. Second shooter confirmed.", createdAt: "Nov 10, 2025" },
  { id: "bk-2", clientId: "c-1", clientName: "Sarah Chen", clientEmail: "sarah@example.com", type: "Engagement - Full Story", category: "Proposals", date: "Jan 15, 2026", time: "4:30 PM", location: "Baker Beach, SF", status: "completed", contractSigned: true, totalAmount: 2200, paidAmount: 2200, payments: [{ id: "pay-3", bookingId: "bk-2", clientName: "Sarah Chen", type: "deposit", label: "Deposit (30%)", amount: 660, status: "paid", date: "Dec 1, 2025" }, { id: "pay-4", bookingId: "bk-2", clientName: "Sarah Chen", type: "final", label: "Final Balance", amount: 1540, status: "paid", date: "Jan 1, 2026" }], notes: "Golden hour shoot, bring blanket for beach shots.", createdAt: "Nov 25, 2025" },
  { id: "bk-3", clientId: "c-2", clientName: "Michael Torres", clientEmail: "michael@example.com", type: "Elopement - Adventure", category: "Elopements", date: "Apr 18, 2026", time: "6:00 AM", location: "Big Sur, CA", status: "confirmed", contractSigned: true, totalAmount: 4200, paidAmount: 1260, payments: [{ id: "pay-5", bookingId: "bk-3", clientName: "Michael Torres", type: "deposit", label: "Deposit (30%)", amount: 1260, status: "paid", date: "Jan 20, 2026" }, { id: "pay-6", bookingId: "bk-3", clientName: "Michael Torres", type: "final", label: "Final Balance", amount: 2940, status: "pending", dueDate: "Apr 4, 2026" }], notes: "Sunrise elopement on Bixby Bridge trail. 5-mile hike.", createdAt: "Jan 15, 2026" },
  { id: "bk-4", clientId: "c-3", clientName: "Rachel Adams", clientEmail: "rachel@example.com", type: "Headshots - Professional", category: "Headshots", date: "Mar 5, 2026", time: "10:00 AM", location: "Studio, SF", status: "pending", contractSigned: false, totalAmount: 650, paidAmount: 0, payments: [], notes: "Needs photos for new startup website.", createdAt: "Feb 18, 2026" },
  { id: "bk-5", clientId: "c-4", clientName: "Jessica & Tom Lee", clientEmail: "jlee@example.com", type: "Wedding - Luxe", category: "Weddings", date: "Jun 14, 2026", time: "11:00 AM", location: "Napa Valley, CA", status: "confirmed", contractSigned: true, totalAmount: 8500, paidAmount: 2550, payments: [{ id: "pay-7", bookingId: "bk-5", clientName: "Jessica & Tom Lee", type: "deposit", label: "Deposit (30%)", amount: 2550, status: "paid", date: "Feb 1, 2026" }, { id: "pay-8", bookingId: "bk-5", clientName: "Jessica & Tom Lee", type: "final", label: "Final Balance", amount: 5950, status: "pending", dueDate: "May 31, 2026" }], notes: "Full day coverage. Rehearsal dinner Friday + wedding Saturday.", createdAt: "Jan 28, 2026" },
];

export const mockPayments: Payment[] = mockBookings.flatMap((b) => b.payments);

export const mockGalleries: Gallery[] = [
  { id: "gal-1", bookingId: "bk-2", clientName: "Sarah Chen", title: "Engagement Session", status: "published", photoCount: 142, createdAt: "Jan 20, 2026", publishedAt: "Feb 5, 2026" },
  { id: "gal-2", bookingId: "bk-1", clientName: "Sarah Chen", title: "Wedding Day", status: "draft", photoCount: 0, createdAt: "Feb 15, 2026" },
];

export const mockPortfolio: PortfolioItem[] = [
  { id: "pf-1", title: "Golden Hour at Baker Beach", category: "Elopements", coverImage: "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?w=600", imageCount: 24, published: true, featured: true, createdAt: "Jan 10, 2026" },
  { id: "pf-2", title: "Napa Valley Vineyard Wedding", category: "Weddings", coverImage: "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?w=600", imageCount: 48, published: true, featured: true, createdAt: "Dec 15, 2025" },
  { id: "pf-3", title: "Surprise at Crissy Field", category: "Proposals", coverImage: "https://images.unsplash.com/photo-1667565454350-fd0484baaa2c?w=600", imageCount: 18, published: true, featured: false, createdAt: "Nov 20, 2025" },
  { id: "pf-4", title: "Stanford Grad 2025", category: "Graduations", coverImage: "https://images.unsplash.com/photo-1637537791710-a78698013174?w=600", imageCount: 12, published: false, featured: false, createdAt: "Feb 1, 2026" },
  { id: "pf-5", title: "Executive Portraits", category: "Headshots", coverImage: "https://images.unsplash.com/photo-1768039376092-70e587cb7b94?w=600", imageCount: 8, published: true, featured: false, createdAt: "Jan 5, 2026" },
];

export const mockClients: Client[] = [
  { id: "c-1", name: "Sarah Chen", email: "sarah@example.com", phone: "(415) 555-0123", bookingCount: 2, totalSpent: 4240, lastBooking: "Mar 22, 2026", status: "active", joinedAt: "Nov 2025" },
  { id: "c-2", name: "Michael Torres", email: "michael@example.com", phone: "(415) 555-0456", bookingCount: 1, totalSpent: 1260, lastBooking: "Apr 18, 2026", status: "active", joinedAt: "Jan 2026" },
  { id: "c-3", name: "Rachel Adams", email: "rachel@example.com", phone: "(650) 555-0789", bookingCount: 1, totalSpent: 0, lastBooking: "Mar 5, 2026", status: "active", joinedAt: "Feb 2026" },
  { id: "c-4", name: "Jessica & Tom Lee", email: "jlee@example.com", phone: "(707) 555-0321", bookingCount: 1, totalSpent: 2550, lastBooking: "Jun 14, 2026", status: "active", joinedAt: "Jan 2026" },
];

export const inquiryStatusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  responded: { label: "Responded", color: "bg-amber-100 text-amber-700" },
  booked: { label: "Booked", color: "bg-green-100 text-green-700" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-500" },
};

export const bookingStatusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-brand-main/10 text-brand-main/60" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600" },
};

export const paymentStatusConfig = {
  paid: { label: "Paid", color: "text-green-600 bg-green-50" },
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50" },
  overdue: { label: "Overdue", color: "text-red-600 bg-red-50" },
  refunded: { label: "Refunded", color: "text-gray-500 bg-gray-50" },
};
