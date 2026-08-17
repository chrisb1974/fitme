import React from 'react';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories', 'Jewellery'];

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="sticky top-0 z-20 bg-white" style={{ borderBottom: '1px solid #E8E6E1' }}>
      <div className="px-5 py-3 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => onChange(cat)}
                className="px-4 py-1.5 text-xs whitespace-nowrap transition-all font-body"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500,
                  borderRadius: '2px',
                  background: isActive ? '#0F0F0F' : '#F5F4F1',
                  color: isActive ? '#fff' : '#6B6B6B',
                  border: isActive ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}