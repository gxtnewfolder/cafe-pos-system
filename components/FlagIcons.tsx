"use client";

// Thai Flag SVG (Circular)
export function ThaiFlag({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <mask id="mask-th">
        <circle cx="256" cy="256" r="256" fill="#fff"/>
      </mask>
      <g mask="url(#mask-th)">
        <path fill="#d80027" d="M0 0h512v89l-79.2 163.7L512 423v89H0v-89l82.7-169.6L0 89z"/>
        <path fill="#eee" d="M0 89h512v78l-42.6 91.2L512 345v78H0v-78l40-92.5L0 167z"/>
        <path fill="#0052b4" d="M0 167h512v178H0z"/>
      </g>
    </svg>
  );
}

// UK Flag SVG (Circular)
export function UKFlag({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <mask id="mask-uk">
        <circle cx="256" cy="256" r="256" fill="#fff"/>
      </mask>
      <g mask="url(#mask-uk)">
        <path fill="#eee" d="m0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z"/>
        <path fill="#0052b4" d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"/>
        <path fill="#d80027" d="M0 0v45l131 131h45L0 0zm208 0v208H0v96h208v208h96V304h208v-96H304V0h-96zm259 0L336 131v45L512 0h-45zM176 336 0 512h45l131-131v-45zm160 0 176 176v-45L381 336h-45z"/>
      </g>
    </svg>
  );
}

// Combined Flag Icon component
export function FlagIcon({ 
  language, 
  className = "w-5 h-5 rounded-full shadow-sm" 
}: { 
  language: string; 
  className?: string;
}) {
  if (language === 'th') {
    return <ThaiFlag className={className} />;
  }
  return <UKFlag className={className} />;
}
