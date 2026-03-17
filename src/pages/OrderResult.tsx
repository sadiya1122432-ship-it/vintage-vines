import React from "react";
import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { motion } from "motion/react";

export default function OrderResult() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative">
          <div className="mx-auto h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg"
          >
            <RefreshCcw className="w-6 h-6 text-stone-400" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-serif text-stone-900">Payment Declined</h1>
          <p className="text-stone-600 text-lg">
            We're sorry, but your payment could not be processed at this time. 
            Please check your card details and try again.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/payment"
            className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="w-full py-4 bg-white text-stone-900 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>

        <p className="text-sm text-stone-400">
          If you continue to have issues, please contact our support team.
        </p>
      </motion.div>
    </div>
  );
}
