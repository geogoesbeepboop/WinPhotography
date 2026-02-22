"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Users, Mail, Phone, Calendar, DollarSign, CalendarCheck, X } from "lucide-react";
import { mockClients, mockBookings, type Client } from "@/lib/mock-data/admin-data";

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = mockClients.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const clientBookings = selectedClient ? mockBookings.filter((b) => b.clientId === selectedClient.id) : [];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Clients</h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>View and manage your client relationships.</p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-main/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }} />
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client, i) => (
          <motion.div key={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button onClick={() => setSelectedClient(client)}
              className="w-full text-left bg-white border border-brand-main/8 p-5 hover:border-brand-tertiary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-tertiary/10 flex items-center justify-center text-brand-tertiary" style={{ fontSize: "0.8rem" }}>
                  {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-brand-main" style={{ fontSize: "0.95rem" }}>{client.name}</h3>
                  <p className="text-brand-main/40" style={{ fontSize: "0.75rem" }}>{client.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-main/6">
                <div>
                  <p className="text-brand-main/70" style={{ fontSize: "0.9rem" }}>{client.bookingCount}</p>
                  <p className="text-brand-main/30" style={{ fontSize: "0.6rem" }}>Bookings</p>
                </div>
                <div>
                  <p className="text-brand-main/70" style={{ fontSize: "0.9rem" }}>${client.totalSpent.toLocaleString()}</p>
                  <p className="text-brand-main/30" style={{ fontSize: "0.6rem" }}>Spent</p>
                </div>
                <div>
                  <p className="text-brand-main/70" style={{ fontSize: "0.9rem" }}>{client.status === "active" ? "Active" : "Past"}</p>
                  <p className="text-brand-main/30" style={{ fontSize: "0.6rem" }}>Status</p>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No clients found.</p>
        </div>
      )}

      {/* Client Detail Slide-over */}
      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedClient(null)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 overflow-y-auto shadow-xl"
            >
              <div className="sticky top-0 bg-brand-main text-brand-secondary px-6 py-4 flex items-center justify-between z-10">
                <h2 className="font-serif" style={{ fontSize: "1.1rem" }}>Client Details</h2>
                <button onClick={() => setSelectedClient(null)} className="p-1 text-brand-secondary/50 hover:text-brand-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-tertiary/10 flex items-center justify-center text-brand-tertiary mx-auto mb-3" style={{ fontSize: "1.2rem" }}>
                    {selectedClient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-serif text-brand-main" style={{ fontSize: "1.3rem" }}>{selectedClient.name}</h3>
                  <p className="text-brand-main/40" style={{ fontSize: "0.8rem" }}>Client since {selectedClient.joinedAt}</p>
                </div>

                {/* Contact */}
                <div className="bg-brand-secondary/50 p-4 space-y-2">
                  <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                    <Mail className="w-4 h-4 text-brand-main/30" /> {selectedClient.email}
                  </a>
                  <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                    <Phone className="w-4 h-4 text-brand-main/30" /> {selectedClient.phone}
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-brand-secondary/50 p-3 text-center">
                    <p className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>{selectedClient.bookingCount}</p>
                    <p className="text-brand-main/40" style={{ fontSize: "0.65rem" }}>Bookings</p>
                  </div>
                  <div className="bg-brand-secondary/50 p-3 text-center">
                    <p className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>${selectedClient.totalSpent.toLocaleString()}</p>
                    <p className="text-brand-main/40" style={{ fontSize: "0.65rem" }}>Total Spent</p>
                  </div>
                  <div className="bg-brand-secondary/50 p-3 text-center">
                    <p className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>{selectedClient.status === "active" ? "Active" : "Past"}</p>
                    <p className="text-brand-main/40" style={{ fontSize: "0.65rem" }}>Status</p>
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Booking History</p>
                  <div className="space-y-3">
                    {clientBookings.map((bk) => (
                      <div key={bk.id} className="bg-brand-secondary/50 p-4">
                        <p className="text-brand-main mb-1" style={{ fontSize: "0.85rem" }}>{bk.type}</p>
                        <div className="flex items-center gap-3 text-brand-main/40" style={{ fontSize: "0.75rem" }}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{bk.date}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${bk.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {clientBookings.length === 0 && (
                      <p className="text-brand-main/30 text-center py-4" style={{ fontSize: "0.8rem" }}>No bookings found.</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4 border-t border-brand-main/8">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase" style={{ fontSize: "0.65rem" }}>
                    <Mail className="w-3.5 h-3.5" /> Send Email
                  </button>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-main/15 text-brand-main/60 hover:text-brand-main hover:border-brand-main/30 transition-colors" style={{ fontSize: "0.7rem" }}>
                    <CalendarCheck className="w-3.5 h-3.5" /> Create New Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
