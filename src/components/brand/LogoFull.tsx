import { FC } from "react";
import logoFull from "@/assets/brand/apex-logo-full.png";

interface LogoFullProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const widthMap = { sm: 120, md: 200, lg: 300 };

const LogoFull: FC<LogoFullProps> = ({ size = "md", className = "" }) => (
  <img
    src={logoFull}
    alt="Apex Global Cart — Commerce at its peak"
    width={widthMap[size]}
    className={`h-auto object-contain ${className}`}
  />
);

export default LogoFull;
