import SeedBar from "./_components/seedbar";

export default function SettingsLayout({ children }) {
  return (
    <div className="flex gap-6">
      <SeedBar />
      <div className="scroll-hidden flex-1  h-[87vh] overflow-y-auto ">
        <main className="">{children}</main>
      </div>
    </div>
  );
}
