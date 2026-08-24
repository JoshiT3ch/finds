'use client';

import React, { useState } from 'react';

export default function ItemActions() {
  const [isSaved, setIsSaved] = useState(false);
  const [messageNotice, setMessageNotice] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setMessageNotice(true)}
        aria-label="Message the seller about this item"
        className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-semibold transition text-base"
      >
        Message Seller
      </button>
      {messageNotice && (
        <p className="text-sm text-gray-600" role="status">
          Messaging will be available when accounts are connected in a later stage.
        </p>
      )}
      <button
        onClick={() => setIsSaved(!isSaved)}
        aria-label={isSaved ? 'Remove from saves' : 'Save this item'}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition text-base border-2 ${
          isSaved
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        {isSaved ? '♥ Saved' : '♡ Save Item'}
      </button>
      {isSaved && (
        <p className="text-sm text-gray-600" role="status">
          Saved for this session only. Account-based saves will come later.
        </p>
      )}
    </div>
  );
}
