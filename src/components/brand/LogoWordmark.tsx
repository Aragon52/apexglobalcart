import { FC } from "react";

interface LogoWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

const LogoWordmark: FC<LogoWordmarkProps> = ({ size = "md", className = "" }) => {
  return (
    <span className={`font-poppins font-bold tracking-tight leading-tight ${sizeMap[size]} ${className}`}>
      <span className="text-brand-orange">Apex </span>
      <span className="text-brand-blue">Global </span>
      <span className="text-brand-green">Cart</span>
    </span>
  );
};

export default LogoWordmark;
