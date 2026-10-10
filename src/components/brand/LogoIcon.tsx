import { FC } from "react";
import logoIcon from "@/assets/brand/apex-logo-icon.png";

type LogoVariant = "header" | "footer" | "default";

const variantSizes: Record<LogoVariant, number> = {
  header: 40,
  footer: 60,
  default: 80,
};

interface LogoIconProps {
  size?: number;
  variant?: LogoVariant;
  className?: string;
}

const LogoIcon: FC<LogoIconProps> = ({ size, variant = "default", className = "" }) => {
  const resolvedSize = size ?? variantSizes[variant];
  return (
    <img
      src={logoIcon}
      alt="Apex Global Onlineshop"
      width={resolvedSize}
      height={resolvedSize}
      className={`object-contain ${className}`}
    />
  );
};

export default LogoIcon;
