import { programmeComparison, type ComparisonCoverage } from "@/lib/public-marketing";

const coverageLabels: Record<ComparisonCoverage, string> = {
  included: "Included",
  "prototype-listed": "Prototype work listed; breadboard method unconfirmed",
  "not-listed": "Custom PCB design not listed in this offer",
};

function Coverage({ value }: { value: ComparisonCoverage }) {
  const included = value === "included";
  const partial = value === "prototype-listed";

  return (
    <span className="inline-flex items-start gap-2 text-sm leading-5">
      <span aria-hidden="true" className={`mt-0.5 font-bold ${included ? "text-emerald-700" : partial ? "text-amber-700" : "text-rose-700"}`}>
        {included ? "✓" : partial ? "~" : "×"}
      </span>
      <span>{coverageLabels[value]}</span>
    </span>
  );
}

export function ProgrammeComparison() {
  return (
    <section aria-labelledby="comparison-title" className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Named-offer comparison</p>
          <h2 id="comparison-title" className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-slate-950 sm:text-6xl">The full journey. In one programme.</h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">This compares published scope, delivery and purchase units for named offers. It is not a company-wide capability ranking.</p>
        </div>

        <div className="mt-12 hidden overflow-hidden rounded-2xl border border-slate-200 lg:block">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <caption className="sr-only">Published programme comparison checked {programmeComparison.benchmarkDate}</caption>
            <thead className="bg-slate-950 text-white">
              <tr>
                <th scope="col" className="w-[18%] p-4">Offer</th>
                {programmeComparison.columns.map((column) => <th key={column} scope="col" className="w-[14%] p-4">{column}</th>)}
                <th scope="col" className="w-[19%] p-4">Live teaching</th>
                <th scope="col" className="w-[21%] p-4">Price and unit</th>
              </tr>
            </thead>
            <tbody>
              {programmeComparison.offers.map((offer) => (
                <tr key={offer.id} className={offer.id === "hll" ? "bg-emerald-50" : "border-t border-slate-200 bg-white"}>
                  <th scope="row" className="p-4 align-top"><span className="block text-base font-semibold text-slate-950">{offer.provider}</span><span className="mt-1 block font-normal text-slate-600">{offer.offer}</span></th>
                  {offer.coverage.map((coverage, index) => <td key={`${offer.id}-${programmeComparison.columns[index]}`} className="p-4 align-top text-slate-700"><Coverage value={coverage} /></td>)}
                  <td className="p-4 align-top leading-6 text-slate-700">{offer.teaching}</td>
                  <td className="p-4 align-top font-medium leading-6 text-slate-900">{offer.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-4 lg:hidden">
          {programmeComparison.offers.map((offer) => (
            <article key={offer.id} className={`rounded-2xl border p-5 ${offer.id === "hll" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <h3 className="text-xl font-semibold text-slate-950">{offer.provider}</h3>
              <p className="mt-1 text-sm text-slate-600">{offer.offer}</p>
              <dl className="mt-5 space-y-4">
                {offer.coverage.map((coverage, index) => <div key={`${offer.id}-mobile-${programmeComparison.columns[index]}`}><dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{programmeComparison.columns[index]}</dt><dd className="mt-1 text-slate-700"><Coverage value={coverage} /></dd></div>)}
                <div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Live teaching</dt><dd className="mt-1 text-sm leading-6 text-slate-700">{offer.teaching}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Price and unit</dt><dd className="mt-1 text-sm font-semibold leading-6 text-slate-900">{offer.price}</dd></div>
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          <p>{programmeComparison.qualification}</p>
          <p className="mt-2">Benchmark checked {programmeComparison.benchmarkDate}. Arduino conversion uses the supplied historical rate from 10 September 2026; availability and prices may change.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {programmeComparison.offers.filter((offer) => offer.source.startsWith("http")).map((offer) => <a key={offer.id} href={offer.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4">{offer.provider} source</a>)}
          </div>
        </div>
      </div>
    </section>
  );
}