import { Board } from "@/components/board/Board";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Toast } from "@/components/ui/Toast";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <Board />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
