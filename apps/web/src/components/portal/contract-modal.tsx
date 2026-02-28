"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, CheckCircle2, FileText, Calendar, MapPin, DollarSign } from "lucide-react";

interface ContractData {
  bookingType: string;
  clientName: string;
  date: string;
  time: string;
  location: string;
  totalAmount: number;
  depositAmount: number;
  signed: boolean;
  signedDate?: string;
  contractId: string;
  contractUrl?: string;
}

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  contract: ContractData;
  onSign?: () => void;
}

export function ContractModal({ open, onClose, contract, onSign }: ContractModalProps) {
  const handleOpenContract = () => {
    if (!contract.contractUrl) return;
    window.open(contract.contractUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-brand-main text-brand-secondary px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-tertiary" />
                <div>
                  <h2 className="font-serif" style={{ fontSize: "1.1rem" }}>
                    Service Agreement
                  </h2>
                  <p className="text-brand-secondary/50" style={{ fontSize: "0.7rem" }}>
                    Contract #{contract.contractId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-brand-secondary/50 hover:text-brand-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 lg:p-8">
              <div className="mb-6">
                {contract.signed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700" style={{ fontSize: "0.8rem" }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Signed on {contract.signedDate}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700" style={{ fontSize: "0.8rem" }}>
                    <FileText className="w-4 h-4" />
                    Awaiting Signature
                  </div>
                )}
              </div>

              <div className="bg-card/50 p-5 mb-6">
                <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>
                  Session Details
                </p>
                <h3 className="font-serif text-brand-main mb-3" style={{ fontSize: "1.2rem" }}>
                  {contract.bookingType}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-brand-main/60" style={{ fontSize: "0.85rem" }}>
                    <Calendar className="w-4 h-4 text-brand-tertiary" />
                    {contract.date}{contract.time ? ` at ${contract.time}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-brand-main/60" style={{ fontSize: "0.85rem" }}>
                    <MapPin className="w-4 h-4 text-brand-tertiary" />
                    {contract.location || "Location pending"}
                  </div>
                </div>
              </div>

              <div className="bg-card/50 p-5 mb-6">
                <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>
                  Payment Terms
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-main/60 flex items-center gap-2" style={{ fontSize: "0.85rem" }}>
                      <DollarSign className="w-4 h-4 text-brand-tertiary" />
                      Total Investment
                    </span>
                    <span className="font-serif text-brand-main" style={{ fontSize: "1.1rem" }}>
                      ${contract.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-main/50" style={{ fontSize: "0.8rem" }}>
                      Retainer Deposit (30%)
                    </span>
                    <span className="text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                      ${contract.depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-main/50" style={{ fontSize: "0.8rem" }}>
                      Final Balance
                    </span>
                    <span className="text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                      ${(contract.totalAmount - contract.depositAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 p-5 mb-6">
                <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-2" style={{ fontSize: "0.65rem" }}>
                  Contract File
                </p>
                {contract.contractUrl ? (
                  <>
                    <p className="text-brand-main/55 mb-3" style={{ fontSize: "0.82rem" }}>
                      This booking is linked to your stored contract record.
                    </p>
                    <button
                      onClick={handleOpenContract}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-brand-main/15 text-brand-main/70 hover:text-brand-main hover:border-brand-main/35 transition-colors"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Contract Document
                    </button>
                  </>
                ) : (
                  <p className="text-brand-main/45" style={{ fontSize: "0.82rem" }}>
                    No contract file is available for this booking yet.
                  </p>
                )}
              </div>

              {!contract.signed && onSign && (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-brand-main/8">
                  <button
                    onClick={onSign}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 tracking-[0.1em] uppercase"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sign Contract & Pay Deposit
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
