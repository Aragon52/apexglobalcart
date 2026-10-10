import { FC } from "react";

interface LogoWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-7xl",
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
