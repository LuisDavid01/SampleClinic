"use client";
import { useState, useEffect, useRef } from "react";
import Button from "../Button";
import "./hamburgerMenu.css";

interface HamburgerMenuProps {
  children: React.ReactNode;
}

const HamburgerMenu = ({ children }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="hamburger-container" ref={menuRef}>
      <Button
        buttonClass="hamburger-button"
        handleClick={() => setIsOpen(!isOpen)}
      >
        <span className={`hamburger-icon ${isOpen ? "open" : ""}`}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </span>
      </Button>

      <nav className={`hamburger-nav bg-background ${isOpen ? "open" : ""}`}>
        <ul className="hamburger-menu text-text-primary">{children}</ul>
      </nav>
    </div>
  );
};

export default HamburgerMenu;
