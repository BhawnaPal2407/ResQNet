/**
 * Button.jsx
 * ---------------------------------------------------------------------
 * One shared button so every red / outline / ghost button across the
 * app looks and behaves the same way.
 *
 * Usage:
 *   <Button>Get Started</Button>
 *   <Button variant="outline">Become a Donor</Button>
 *   <Button variant="ghost" icon={ArrowRight}>Explore</Button>
 *   <Button as="link" to="/signup">Create Account</Button>
 * ---------------------------------------------------------------------
 */
import { Link } from "react-router-dom";

const VARIANTS = {
  // Solid red CTA — the primary action on every page
  solid:
    "bg-rq-red text-white hover:bg-red-700 shadow-glow border border-rq-red",
  // Outlined button — secondary action
  outline:
    "bg-transparent text-rq-text border border-rq-border hover:border-rq-red hover:text-rq-red",
  // Text-only button — tertiary / inline links
  ghost: "bg-transparent text-rq-red hover:underline px-0",
};

export default function Button({
  children,
  variant = "solid",
  icon: Icon,
  iconPosition = "left",
  as = "button",
  to = "#",
  type = "button",
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap";
  const classes = `${base} ${VARIANTS[variant]} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon size={18} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </>
  );

  if (as === "link") {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
