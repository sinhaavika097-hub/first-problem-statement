import React, { useState, useMemo } from 'react';
import {
  Search,
  Thermometer,
  Clock,
  ShieldAlert,
  Snowflake,
  Info,
} from 'lucide-react';
import { PRESERVATION_CATALOG } from '../data/preservationCatalog';
import { BiologicalCategory, PreservationRule } from '../types/coldChain';
import { formatMinutes } from '../utils/alertEngine';

export const PreservationReferenceTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | BiologicalCategory>('ALL');

  const filteredRules = useMemo(() => {
    return PRESERVATION_CATALOG.filter((rule) => {
      const matchesCategory =
        selectedCategory === 'ALL' || rule.category === selectedCategory;
      const matchesSearch =
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.clinicalNotes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            Clinical Preservation & Storage Time Span Reference
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative clinical standards for cold ischemia times (CIT) and preservation temperature brackets.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organ or vaccine..."
              className="bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
            {(['ALL', 'ORGAN', 'VACCINE_ULT', 'VACCINE_COLD', 'BLOOD_PRODUCT'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'All'
                    : cat === 'ORGAN'
                    ? 'Organs'
                    : cat === 'VACCINE_ULT'
                    ? 'ULT Vaccines'
                    : cat === 'VACCINE_COLD'
                    ? 'Cold Vaccines'
                    : 'Blood'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 pr-4">Biological Specimen</th>
              <th className="pb-3 px-4">Category</th>
              <th className="pb-3 px-4">Safe Temp Range</th>
              <th className="pb-3 px-4">Max Storage / CIT Span</th>
              <th className="pb-3 px-4">Warning SLA</th>
              <th className="pb-3 px-4">Freeze Risk</th>
              <th className="pb-3 pl-4">Clinical Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {filteredRules.map((rule: PreservationRule) => {
              const isOrgan = rule.category === 'ORGAN' || rule.category === 'TISSUE';
              return (
                <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-white">
                    {rule.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOrgan
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {rule.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                    <span className="inline-flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      {rule.tempMinCelsius}°C to {rule.tempMaxCelsius}°C
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {formatMinutes(rule.maxPreservationMinutes)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {formatMinutes(rule.warningPreservationMinutes)}
                  </td>
                  <td className="py-3 px-4">
                    {rule.freezeSensitive ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                        <Snowflake className="w-3.5 h-3.5" />
                        Zero Freeze
                      </span>
                    ) : (
                      <span className="text-slate-500">Tolerant</span>
                    )}
                  </td>
                  <td className="py-3 pl-4 text-slate-400 max-w-xs truncate" title={rule.clinicalNotes}>
                    {rule.clinicalNotes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
