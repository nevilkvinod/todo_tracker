import * as React from "react"
import { cn } from "@/utils/cn"

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Avatar({ className, src, fallback, size = 'md', ...props }: AvatarProps) {
  const sizes = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div className={cn("relative flex shrink-0 overflow-hidden rounded-full font-medium bg-secondary text-secondary-foreground justify-center items-center", sizes[size], className)}>
      {src ? (
        <img src={src} className="aspect-square h-full w-full object-cover" {...props} />
      ) : (
        <span>{fallback?.charAt(0) || '?'}</span>
      )}
    </div>
  )
}

export { Avatar }
