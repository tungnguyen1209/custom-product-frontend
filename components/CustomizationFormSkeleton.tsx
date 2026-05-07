export default function CustomizationFormSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Gift badge */}
      <div className="h-11 bg-[#fff0f0] rounded-xl" />

      {/* Option rows */}
      {[80, 60, 100, 72, 90].map((w, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 bg-gray-100 rounded-full" style={{ width: `${w}px` }} />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
      ))}

      {/* Swatch row */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-20 bg-gray-100 rounded-full" />
        <div className="flex gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Quantity + buttons */}
      <div className="h-10 bg-gray-100 rounded-xl w-32" />
      <div className="h-12 bg-gray-100 rounded-2xl w-full" />
      <div className="h-12 bg-gray-100 rounded-2xl w-full" />
    </div>
  );
}
