"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Download, CheckCircle2, FileText, Calendar, MapPin, DollarSign } from "lucide-react";

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
}

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  contract: ContractData;
  onSign?: () => void;
}

export function ContractModal({ open, onClose, contract, onSign }: ContractModalProps) {
  const handleDownloadPDF = () => {
    // Simulate PDF download
    const blob = new Blob(
      [
        `PHOTOGRAPHY SERVICE AGREEMENT\n\nContract #: ${contract.contractId}\n\nThis agreement is between Mae Win Photography ("Photographer") and ${contract.clientName} ("Client").\n\nService: ${contract.bookingType}\nDate: ${contract.date} at ${contract.time}\nLocation: ${contract.location}\n\nTotal Investment: $${contract.totalAmount.toLocaleString()}\nRetainer Deposit (30%): $${contract.depositAmount.toLocaleString()}\nFinal Balance: $${(contract.totalAmount - contract.depositAmount).toLocaleString()}\n\nTERMS & CONDITIONS\n\n1. BOOKING & RETAINER\nA non-refundable retainer of 30% is required to secure the date. The remaining balance is due 14 days before the session date.\n\n2. CANCELLATION POLICY\nIf Client cancels more than 30 days before the session, the retainer is forfeited. Cancellations within 30 days forfeit the full amount. Photographer reserves the right to cancel and refund the full amount in case of emergency.\n\n3. IMAGE DELIVERY\nImages will be delivered via private online gallery within the timeframe specified in the selected package. Client receives a personal use print release for all delivered images.\n\n4. COPYRIGHT & USAGE\nPhotographer retains copyright of all images. Client receives a personal use license. Images may be used by Photographer for portfolio, social media, and marketing purposes unless otherwise agreed in writing.\n\n5. LIABILITY\nPhotographer is not liable for images lost due to equipment failure, though every precaution is taken (dual card slots, backup equipment). Total liability shall not exceed the total amount paid.\n\n6. MODEL RELEASE\nClient grants Photographer permission to use images for promotional purposes. Client may opt out of this in writing.\n\n${contract.signed ? `\nSIGNED by ${contract.clientName} on ${contract.signedDate}\nContract executed electronically.` : "\n[PENDING SIGNATURE]"}`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaeWin_Contract_${contract.contractId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
              {/* Status badge */}
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

              {/* Booking Details */}
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
                    {contract.date} at {contract.time}
                  </div>
                  <div className="flex items-center gap-2 text-brand-main/60" style={{ fontSize: "0.85rem" }}>
                    <MapPin className="w-4 h-4 text-brand-tertiary" />
                    {contract.location}
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
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
                      Final Balance (due 14 days before)
                    </span>
                    <span className="text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                      ${(contract.totalAmount - contract.depositAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contract Terms */}
              <div className="mb-6">
                <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-4" style={{ fontSize: "0.65rem" }}>
                  Terms & Conditions
                </p>
                <div className="space-y-4">
                  {[
                    {
                      title: "1. Booking & Retainer",
                      text: "A non-refundable retainer of 30% is required to secure the date. The remaining balance is due 14 days before the session date.",
                    },
                    {
                      title: "2. Cancellation Policy",
                      text: "If Client cancels more than 30 days before the session, the retainer is forfeited. Cancellations within 30 days forfeit the full amount.",
                    },
                    {
                      title: "3. Image Delivery",
                      text: "Images will be delivered via private online gallery within the timeframe specified in the selected package. Client receives a personal use print release.",
                    },
                    {
                      title: "4. Copyright & Usage",
                      text: "Photographer retains copyright of all images. Client receives a personal use license. Images may be used for portfolio and marketing unless otherwise agreed.",
                    },
                    {
                      title: "5. Liability",
                      text: "Photographer is not liable for images lost due to equipment failure, though every precaution is taken. Total liability shall not exceed the total amount paid.",
                    },
                    {
                      title: "6. Model Release",
                      text: "Client grants permission to use images for promotional purposes. Client may opt out in writing.",
                    },
                  ].map((term) => (
                    <div key={term.title}>
                      <h4 className="text-brand-main mb-1" style={{ fontSize: "0.85rem" }}>
                        {term.title}
                      </h4>
                      <p className="text-brand-main/50" style={{ fontSize: "0.8rem", lineHeight: "1.7" }}>
                        {term.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-brand-main/8">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-main/15 text-brand-main hover:bg-brand-main hover:text-brand-secondary transition-all duration-300 tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Contract
                </button>
                {!contract.signed && onSign && (
                  <button
                    onClick={onSign}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 tracking-[0.1em] uppercase"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sign Contract & Pay Deposit
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
