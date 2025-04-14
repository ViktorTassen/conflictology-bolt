export function EmptyPlayerCard() {
  return (
    <div className="relative">
      <div className="relative z-10 bg-[#2a2a2a]/40 backdrop-blur-sm rounded-lg border border-white/5">
        <div className="flex items-center p-1.5 gap-1.5 max-w-[160px]">
          {/* Empty avatar circle */}
          <div className="relative shrink-0">
            <div className="w-6 h-6 rounded-full bg-white/5" />
          </div>
        </div>
      </div>

    </div>
  );
}