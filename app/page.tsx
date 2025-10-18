import TextBoxInput from "./components/TextBoxInput";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-4xl">
        <TextBoxInput />
      </div>
    </div>
  );
}
