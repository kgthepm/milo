export default function MobileButtonStack({ children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row ${className}`}>
      {children}
    </div>
  );
}
