export const UnderConstruction = ({ pageName }: { pageName: string }) => {
  return (
    <div className="under-construction">
      <h2>🚧 {pageName} 🚧</h2>
      <p>This page is currently under construction.</p>
      <p>Check back soon for updates!</p>
    </div>
  );
};
