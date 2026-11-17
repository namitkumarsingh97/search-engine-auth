/** Slim page header: the Nexa mark and a label saying this is the accounts app. */
export default function Masthead() {
  return (
    <header>
      <div className="bg-ink text-canvas">
        <div className="mx-auto flex h-7 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <span className="kicker text-mustard">Nexa Accounts</span>
          <span className="kicker hidden text-canvas/70 sm:block">Secure sign-in</span>
        </div>
      </div>
      <div className="border-b-4 border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2.5 px-5 sm:px-8">
          <span className="flex h-9 w-9 items-center justify-center border-2 border-line bg-accent text-xl font-black leading-none text-white">N</span>
          <span className="display text-3xl">Nexa</span>
        </div>
      </div>
    </header>
  );
}
