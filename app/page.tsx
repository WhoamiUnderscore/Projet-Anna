import Chronologie from "@/components/chronologie"

import Fetch from "@/class/fetch-class"

export default async function Home() {
  const chronologie_datas = await Fetch.getDatas("/chronologie");
  const chronologie_elements = chronologie_datas.data.sort((a, b) => a.from - b.from);

  return (
    <main>
      <Chronologie elements={chronologie_elements} />
    </main>
  );
}
