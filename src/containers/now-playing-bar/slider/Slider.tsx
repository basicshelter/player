import { ReactNode } from "react";
import './Slider.css';

type SliderProps = {
  id: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  children: ReactNode;
};
export const Slider = ({
  id,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  children,
}: SliderProps) => {
  return (
    <label className="slider">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          onChange?.(Number(e.currentTarget.value));
        }}
        disabled={disabled}
      />
      <output
        htmlFor={id}
        style={{ "--min": min, "--max": max } as React.CSSProperties}
      >
        {children}
      </output>
    </label>
  );
};
