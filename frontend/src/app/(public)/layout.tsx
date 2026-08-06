const UnauthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">{children}</div>;
};

export default UnauthenticatedLayout;
