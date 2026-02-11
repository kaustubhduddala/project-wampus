import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
