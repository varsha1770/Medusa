import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-gray-100 w-full bg-slate-50/50 pt-24 pb-12 shadow-[0_-1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-12 xsmall:flex-row items-start justify-between pb-20 border-b border-gray-200/60">
          <div className="max-w-[320px]">
             <LocalizedClientLink
              href="/"
              className="font-[650] text-2xl tracking-tighter text-blue-950 hover:text-blue-600 transition-all duration-500 flex items-center gap-3 mb-8 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-base shadow-xl shadow-blue-200 group-hover:scale-105 transition-transform duration-500">M</div>
              <span className="group-hover:tracking-tight transition-all duration-500">Tif Medusa <span className="text-blue-600">.</span></span>
            </LocalizedClientLink>
            <p className="text-gray-500 text-[13px] leading-loose font-medium opacity-80 decoration-slate-200">
              Elevating modern living through artisanal furniture and timeless design. 
              Our curated pieces bring a masterfully crafted soul to every home.
            </p>
          </div>

          <div className="text-small-regular gap-12 md:gap-x-24 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-8">
                <span className="font-bold text-[10px] uppercase tracking-[0.25em] text-blue-950/40 border-b border-blue-950/10 pb-3">
                  Categories
                </span>
                <ul
                  className="flex flex-col gap-4"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) return null;
                    
                    // Boutique Name Mapping for Footer
                    const categoryMap: Record<string, string> = {
                      "shirts": "Living Room",
                      "sweatshirts": "Bedroom",
                      "pants": "Sofas",
                      "merch": "Dining",
                      "dining": "Dining",
                      "living-room": "Living Room",
                      "bedroom": "Bedroom",
                      "sofas": "Sofas"
                    }

                    const displayName = categoryMap[c.handle.toLowerCase()] || c.name;

                    return (
                      <li key={c.id}>
                        <LocalizedClientLink
                          className="text-gray-500 text-sm font-[350] hover:text-blue-600 transition-all duration-300 flex items-center gap-2 group"
                          href={`/categories/${c.handle}`}
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-300 tracking-wide">
                            {displayName}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-8">
                <span className="font-bold text-[10px] uppercase tracking-[0.25em] text-blue-950/40 border-b border-blue-950/10 pb-3">
                  Collections
                </span>
                <ul className="flex flex-col gap-4">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-gray-500 text-sm font-[350] hover:text-blue-600 transition-all duration-300 flex items-center gap-2 group"
                        href={`/collections/${c.handle}`}
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300 tracking-wide">
                          {c.title}
                        </span>
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-8">
              <span className="font-bold text-[10px] uppercase tracking-[0.25em] text-blue-950/40 border-b border-blue-950/10 pb-3">
                Ecosystem
              </span>
              <ul className="flex flex-col gap-4">
                <li>
                   <a href="https://github.com/medusajs" target="_blank" rel="noreferrer" className="text-gray-500 text-sm font-[350] hover:text-blue-600 transition-all duration-300 flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-300 tracking-wide">GitHub</span>
                  </a>
                </li>
                <li>
                  <a href="https://docs.medusajs.com" target="_blank" rel="noreferrer" className="text-gray-500 text-sm font-[350] hover:text-blue-600 transition-all duration-300 flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-300 tracking-wide">Documentation</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full mt-16 items-center justify-between gap-6 opacity-60">
           <Text className="text-gray-500 font-medium text-[11px] uppercase tracking-widest">
            © {new Date().getFullYear()} Tif Medusa Boutique. masterfully curated.
          </Text>
          <div className="px-5 py-2.5 rounded-full border border-gray-200/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-500">
            <MedusaCTA />
          </div>
        </div>
      </div>
    </footer>
  )
}
