export default function Marquee() {
  const features = [
    'Upload',
    'Rotate',
    'Crop',
    'Draw',
    'Add Text',
    'Undo',
    'Redo',
    'Export PNG'
  ];

  return (
    <div className="mt-16 w-full overflow-hidden opacity-80">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Duplicate features array for seamless loop */}
        {[...features, ...features].map((feature, index) => (
          <span key={index} className="inline-flex items-center">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mx-8">
              {feature}
            </span>
            <span className="text-slate-400 dark:text-slate-600 mx-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}