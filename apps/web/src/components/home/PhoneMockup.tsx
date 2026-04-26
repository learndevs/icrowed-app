export function PhoneMockup({ gradient = "from-indigo-400 via-purple-500 to-pink-400" }: { gradient?: string }) {
  return (
    <div className="relative w-36 h-64 sm:w-44 sm:h-80 lg:w-52 lg:h-96 mx-auto select-none">
      {/* Glow blob behind phone */}
      <div
        className={`absolute -inset-6 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-3xl animate-blob`}
      />

      {/* Orbiting dot 1 */}
      <div className="absolute top-4 -right-3 w-4 h-4 rounded-full bg-indigo-400 opacity-70 animate-float" />
      {/* Orbiting dot 2 */}
      <div className="absolute bottom-8 -left-4 w-3 h-3 rounded-full bg-pink-400 opacity-60 animate-float-slow" />
      {/* Orbiting dot 3 */}
      <div className="absolute top-1/2 -right-6 w-2 h-2 rounded-full bg-lime-400 opacity-80 animate-float" style={{ animationDelay: "1s" }} />

      {/* Phone frame */}
      <div className="relative w-full h-full rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl shadow-black/40 border border-white/10">

        {/* Side buttons */}
        <div className="absolute -left-[3px] top-20 w-[3px] h-10 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-32 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
        <div className="absolute -right-[3px] top-24 w-[3px] h-12 bg-gray-700 rounded-r-sm" />

        {/* Screen */}
        <div className="absolute inset-[4px] rounded-[2.2rem] overflow-hidden">
          {/* Wallpaper gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

          {/* Screen content */}
          <div className="relative h-full flex flex-col p-3">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-white text-[7px] font-semibold opacity-90">9:41</span>
              <div className="flex items-center gap-[3px]">
                {[3, 2, 1].map((h, i) => (
                  <div key={i} className="bg-white/80 rounded-sm" style={{ width: 3, height: h * 3 + 3 }} />
                ))}
                <div className="ml-1 w-4 h-2 border border-white/80 rounded-sm relative">
                  <div className="absolute inset-[2px] right-1 bg-white/80 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Dynamic island */}
            <div className="flex justify-center mb-2">
              <div className="w-16 h-4 bg-black/70 rounded-full backdrop-blur-sm" />
            </div>

            {/* App grid */}
            <div className="flex-1 grid grid-cols-4 gap-2 px-1">
              {[
                "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500",
                "bg-red-500", "bg-cyan-500", "bg-yellow-500", "bg-pink-500",
                "bg-indigo-500", "bg-teal-500", "bg-rose-500", "bg-lime-500",
              ].map((color, i) => (
                <div
                  key={i}
                  className={`${color} rounded-[8px] aspect-square shadow-sm flex items-center justify-center`}
                >
                  <div className="w-3 h-3 bg-white/30 rounded-sm" />
                </div>
              ))}
            </div>

            {/* Dock */}
            <div className="mt-2 mb-1 mx-1 py-2 px-2 glass-subtle rounded-2xl flex justify-around">
              {["bg-green-400", "bg-blue-400", "bg-gray-300", "bg-red-400"].map((color, i) => (
                <div key={i} className={`w-7 h-7 ${color} rounded-xl shadow-sm`} />
              ))}
            </div>
          </div>
        </div>

        {/* Camera notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          <div className="w-2 h-2 rounded-full bg-gray-700 border border-gray-600" />
        </div>

        {/* Reflection overlay */}
        <div className="absolute inset-[4px] rounded-[2.2rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
