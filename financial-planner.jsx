import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#dc2626'];

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
const fmtShort = (v) => {
  if (!v && v !== 0) return '$0';
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${Math.round(v)}`;
};

// ── Input components ──────────────────────────────────────────────────────────
const CurrencyInput = ({ label, value, onChange, small }) => (
  <div className={small ? "mb-2" : "mb-3"}>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-2.5 top-1.5 text-gray-400 text-sm">$</span>
      <input
        type="number" min="0" value={value || ""}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0"
        className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
      />
    </div>
  </div>
);

const PctInput = ({ label, value, onChange }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      <input
        type="number" step="0.1" value={value || ""}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
      />
      <span className="absolute right-2.5 top-1.5 text-gray-400 text-sm">%</span>
    </div>
  </div>
);

const NumInput = ({ label, value, onChange, min, max }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type="number" value={value || ""} min={min} max={max}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
    />
  </div>
);

const TxtInput = ({ label, value, onChange, placeholder }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type="text" value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
    />
  </div>
);

const Card = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
      {icon && <span>{icon}</span>}{title}
    </h3>
    {children}
  </div>
);

const Subtotal = ({ label, value, red }) => (
  <div className={`text-xs mt-3 pt-2 border-t border-gray-100 flex justify-between ${red ? 'text-red-600' : 'text-blue-700'}`}>
    <span>{label}</span>
    <span className="font-semibold">{fmt(value)}</span>
  </div>
);

const StatTile = ({ label, value, sub, bg }) => (
  <div className={`rounded-2xl p-4 ${bg}`}>
    <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
    <p className="text-xl font-bold">{value}</p>
    {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
  </div>
);

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);

  // Personal
  const [household, setHousehold] = useState("My Household");
  const [age, setAge] = useState(38);
  const [retAge, setRetAge] = useState(65);

  // Cash
  const [checking, setChecking] = useState(0);
  const [savings, setSavings] = useState(0);
  const [moneyMkt, setMoneyMkt] = useState(0);

  // Investments
  const [brokerage, setBrokerage] = useState(0);
  const [rsus, setRsus] = useState(0);
  const [crypto, setCrypto] = useState(0);

  // Retirement accounts
  const [k401, setK401] = useState(0);
  const [roth401, setRoth401] = useState(0);
  const [ira, setIra] = useState(0);
  const [rothIra, setRothIra] = useState(0);
  const [pension, setPension] = useState(0);
  const [retOther, setRetOther] = useState(0);

  // Real estate (up to 3)
  const [props, setProps] = useState([
    { name: "Primary Home", value: 0, mortgage: 0 },
    { name: "", value: 0, mortgage: 0 },
    { name: "", value: 0, mortgage: 0 },
  ]);
  const updProp = (i, f, v) => setProps(p => p.map((x, j) => j === i ? { ...x, [f]: v } : x));

  // Other assets
  const [vehicles, setVehicles] = useState(0);
  const [otherAssets, setOtherAssets] = useState(0);

  // Liabilities (non-mortgage)
  const [carLoan1, setCarLoan1] = useState(0);
  const [carLoan2, setCarLoan2] = useState(0);
  const [cc, setCc] = useState(0);
  const [studentLoan, setStudentLoan] = useState(0);
  const [otherDebt, setOtherDebt] = useState(0);

  // Retirement inputs
  const [income, setIncome] = useState(120000);
  const [annSavings, setAnnSavings] = useState(24000);
  const [retReturn, setRetReturn] = useState(7);
  const [inflation, setInflation] = useState(3);
  const [retIncome, setRetIncome] = useState(90000);
  const [ssMo, setSsMo] = useState(2200);

  // College savings — up to 4 children
  const [kids, setKids] = useState([
    { on: false, name: "", age: 0, bal: 0, mo: 0, annCost: 35000, yrs: 4 },
    { on: false, name: "", age: 0, bal: 0, mo: 0, annCost: 35000, yrs: 4 },
    { on: false, name: "", age: 0, bal: 0, mo: 0, annCost: 35000, yrs: 4 },
    { on: false, name: "", age: 0, bal: 0, mo: 0, annCost: 35000, yrs: 4 },
  ]);
  const updKid = (i, f, v) => setKids(k => k.map((x, j) => j === i ? { ...x, [f]: v } : x));

  // ── Computed ────────────────────────────────────────────────────────────────
  const c = useMemo(() => {
    const cash = checking + savings + moneyMkt;
    const inv = brokerage + rsus + crypto;
    const ret = k401 + roth401 + ira + rothIra + pension + retOther;
    const reVal = props.reduce((s, p) => s + p.value, 0);
    const reMort = props.reduce((s, p) => s + p.mortgage, 0);
    const otherA = vehicles + otherAssets;
    const totalAssets = cash + inv + ret + reVal + otherA;
    const totalLiab = reMort + carLoan1 + carLoan2 + cc + studentLoan + otherDebt;
    const netWorth = totalAssets - totalLiab;

    const assetPie = [
      { name: "Cash & Equiv", value: cash },
      { name: "Investments", value: inv },
      { name: "Retirement", value: ret },
      { name: "Real Estate", value: reVal },
      { name: "Other", value: otherA },
    ].filter(a => a.value > 0);

    // Retirement projection
    const yrs = Math.max(0, retAge - age);
    const r = retReturn / 100;
    const inf = inflation / 100;
    let port = ret + inv;
    const retChart = [];
    const portTarget = Math.max(0, (retIncome - ssMo * 12)) / 0.04;
    for (let y = 0; y <= yrs; y++) {
      retChart.push({ age: age + y, portfolio: Math.round(port), target: Math.round(portTarget) });
      port = port * (1 + r) + annSavings;
    }
    const projPort = retChart[retChart.length - 1]?.portfolio || 0;
    const gap = projPort - portTarget;

    // Post-retirement (30 yrs)
    const annWithdrawal = Math.max(0, retIncome - ssMo * 12);
    let pPort = projPort;
    const postChart = [];
    for (let y = 0; y <= 30; y++) {
      postChart.push({ age: retAge + y, portfolio: Math.max(0, Math.round(pPort)) });
      pPort = pPort * (1 + r) - annWithdrawal * Math.pow(1 + inf, y);
    }

    // College
    const collegeResults = kids.map(kid => {
      if (!kid.on || !kid.name) return null;
      const ytc = Math.max(0, 18 - kid.age);
      let bal = kid.bal;
      for (let y = 0; y < ytc; y++) bal = bal * 1.06 + kid.mo * 12;
      const futureCostPerYr = kid.annCost * Math.pow(1 + inf, ytc);
      const totalCost = futureCostPerYr * kid.yrs;
      const pct = totalCost > 0 ? Math.min(100, Math.round((bal / totalCost) * 100)) : 100;
      return { name: kid.name, age: kid.age, ytc, proj: Math.round(bal), cost: Math.round(totalCost), gap: Math.round(bal - totalCost), pct };
    }).filter(Boolean);

    return {
      cash, inv, ret, reVal, reMort, otherA, totalAssets, totalLiab, netWorth,
      assetPie, retChart, projPort, portTarget, gap, postChart, collegeResults,
      yrs,
    };
  }, [
    checking, savings, moneyMkt, brokerage, rsus, crypto,
    k401, roth401, ira, rothIra, pension, retOther,
    props, vehicles, otherAssets,
    carLoan1, carLoan2, cc, studentLoan, otherDebt,
    age, retAge, annSavings, retReturn, inflation, retIncome, ssMo, kids,
  ]);

  const TABS = ["📋 Inputs", "💰 Net Worth", "🏖️ Retirement", "🎓 College"];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Financial Planning Dashboard</h1>
            <p className="text-blue-200 text-sm">{household}</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-blue-300 text-xs">Net Worth</p>
              <p className={`text-lg font-bold ${c.netWorth >= 0 ? 'text-white' : 'text-red-300'}`}>{fmtShort(c.netWorth)}</p>
            </div>
            <div>
              <p className="text-blue-300 text-xs">Retire in</p>
              <p className="text-lg font-bold">{c.yrs} yrs</p>
            </div>
            <div>
              <p className="text-blue-300 text-xs">Proj. Portfolio</p>
              <p className="text-lg font-bold">{fmtShort(c.projPort)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${tab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── TAB 1: INPUTS ────────────────────────────────────────────────── */}
        {tab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Personal */}
            <div className="lg:col-span-2">
              <Card title="Personal Information" icon="👤">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TxtInput label="Household / Name" value={household} onChange={setHousehold} placeholder="My Household" />
                  <NumInput label="Your Current Age" value={age} onChange={setAge} min={18} max={85} />
                  <NumInput label="Target Retirement Age" value={retAge} onChange={setRetAge} min={45} max={90} />
                </div>
              </Card>
            </div>

            {/* Cash */}
            <Card title="Cash & Equivalents" icon="🏦">
              <CurrencyInput label="Checking Account(s)" value={checking} onChange={setChecking} />
              <CurrencyInput label="Savings Account(s)" value={savings} onChange={setSavings} />
              <CurrencyInput label="Money Market / CDs / T-Bills" value={moneyMkt} onChange={setMoneyMkt} />
              <Subtotal label="Subtotal" value={c.cash} />
            </Card>

            {/* Investments */}
            <Card title="Investment Accounts" icon="📈">
              <CurrencyInput label="Taxable Brokerage" value={brokerage} onChange={setBrokerage} />
              <CurrencyInput label="RSUs / Stock Options (vested)" value={rsus} onChange={setRsus} />
              <CurrencyInput label="Crypto / Other" value={crypto} onChange={setCrypto} />
              <Subtotal label="Subtotal" value={c.inv} />
            </Card>

            {/* Retirement accounts */}
            <Card title="Retirement Accounts" icon="🏖️">
              <div className="grid grid-cols-2 gap-x-4">
                <CurrencyInput label="401(k)" value={k401} onChange={setK401} small />
                <CurrencyInput label="Roth 401(k)" value={roth401} onChange={setRoth401} small />
                <CurrencyInput label="Traditional IRA" value={ira} onChange={setIra} small />
                <CurrencyInput label="Roth IRA" value={rothIra} onChange={setRothIra} small />
                <CurrencyInput label="Pension (PV)" value={pension} onChange={setPension} small />
                <CurrencyInput label="Other Retirement" value={retOther} onChange={setRetOther} small />
              </div>
              <Subtotal label="Subtotal" value={c.ret} />
            </Card>

            {/* Other assets */}
            <Card title="Other Assets" icon="🚗">
              <CurrencyInput label="Vehicles (estimated value)" value={vehicles} onChange={setVehicles} />
              <CurrencyInput label="Other Assets (jewelry, business, etc.)" value={otherAssets} onChange={setOtherAssets} />
              <Subtotal label="Subtotal" value={c.otherA} />
            </Card>

            {/* Real Estate */}
            <div className="lg:col-span-2">
              <Card title="Real Estate" icon="🏠">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {props.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <TxtInput label={`Property ${i + 1} Name`} value={p.name} onChange={v => updProp(i, 'name', v)} placeholder={i === 0 ? "Primary Home" : `Property ${i + 1}`} />
                      <CurrencyInput label="Estimated Market Value" value={p.value} onChange={v => updProp(i, 'value', v)} />
                      <CurrencyInput label="Mortgage Balance" value={p.mortgage} onChange={v => updProp(i, 'mortgage', v)} />
                      {p.value > 0 && (
                        <p className="text-xs text-green-700 font-medium">Equity: {fmt(p.value - p.mortgage)}</p>
                      )}
                    </div>
                  ))}
                </div>
                <Subtotal label="Total Real Estate Value" value={c.reVal} />
              </Card>
            </div>

            {/* Liabilities */}
            <Card title="Liabilities (Non-Mortgage)" icon="💳">
              <CurrencyInput label="Car Loan 1" value={carLoan1} onChange={setCarLoan1} />
              <CurrencyInput label="Car Loan 2" value={carLoan2} onChange={setCarLoan2} />
              <CurrencyInput label="Credit Card Debt" value={cc} onChange={setCc} />
              <CurrencyInput label="Student Loans" value={studentLoan} onChange={setStudentLoan} />
              <CurrencyInput label="Other Debt" value={otherDebt} onChange={setOtherDebt} />
              <Subtotal label="Total Non-Mortgage Debt" value={c.totalLiab - c.reMort} red />
            </Card>

            {/* Retirement inputs */}
            <Card title="Retirement Planning Inputs" icon="🎯">
              <CurrencyInput label="Annual Household Income" value={income} onChange={setIncome} />
              <CurrencyInput label="Annual Amount Saved for Retirement" value={annSavings} onChange={setAnnSavings} />
              <CurrencyInput label="Desired Annual Retirement Income (today's $)" value={retIncome} onChange={setRetIncome} />
              <CurrencyInput label="Expected Monthly Social Security" value={ssMo} onChange={setSsMo} />
              <div className="grid grid-cols-2 gap-4">
                <PctInput label="Expected Annual Return" value={retReturn} onChange={setRetReturn} />
                <PctInput label="Inflation Rate" value={inflation} onChange={setInflation} />
              </div>
            </Card>

            {/* College Savings */}
            <div className="lg:col-span-2">
              <Card title="College Savings (529 Plans)" icon="🎓">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {kids.map((kid, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <label className="flex items-center gap-2 mb-3 cursor-pointer">
                        <input type="checkbox" checked={kid.on} onChange={e => updKid(i, 'on', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-semibold text-gray-700">
                          Child {i + 1}{kid.name ? ` — ${kid.name}` : ''}
                        </span>
                      </label>
                      {kid.on && (
                        <div>
                          <div className="grid grid-cols-2 gap-3">
                            <TxtInput label="Child's Name" value={kid.name} onChange={v => updKid(i, 'name', v)} placeholder="Name" />
                            <NumInput label="Current Age" value={kid.age} onChange={v => updKid(i, 'age', v)} min={0} max={17} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <CurrencyInput label="Current 529 Balance" value={kid.bal} onChange={v => updKid(i, 'bal', v)} />
                            <CurrencyInput label="Monthly Contribution" value={kid.mo} onChange={v => updKid(i, 'mo', v)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <CurrencyInput label="Annual Cost (today's $)" value={kid.annCost} onChange={v => updKid(i, 'annCost', v)} />
                            <NumInput label="Years of College" value={kid.yrs} onChange={v => updKid(i, 'yrs', v)} min={1} max={6} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* ── TAB 2: NET WORTH ─────────────────────────────────────────────── */}
        {tab === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatTile label="Total Assets" value={fmt(c.totalAssets)} bg="bg-blue-50 text-blue-900" />
              <StatTile label="Total Liabilities" value={fmt(c.totalLiab)} bg="bg-red-50 text-red-900" />
              <StatTile label="Net Worth" value={fmt(c.netWorth)}
                bg={c.netWorth >= 0 ? "bg-green-50 text-green-900" : "bg-orange-50 text-orange-900"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Asset Pie */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Asset Allocation</h3>
                {c.assetPie.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={c.assetPie} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                          label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                          {c.assetPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-3">
                      {c.assetPie.map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-gray-600">{a.name}</span>
                          </div>
                          <span className="font-medium">{fmt(a.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-400 py-12 text-sm">Enter values on the Inputs tab</p>
                )}
              </div>

              {/* Assets vs Liabilities */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Assets vs. Liabilities</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { name: "Assets", v: c.totalAssets, fill: "#2563eb" },
                    { name: "Liabilities", v: c.totalLiab, fill: "#dc2626" },
                    { name: "Net Worth", v: c.netWorth, fill: c.netWorth >= 0 ? "#16a34a" : "#f97316" },
                  ]} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => fmt(v)} />
                    <Bar dataKey="v" name="Amount" radius={[6, 6, 0, 0]}>
                      {[
                        <Cell key={0} fill="#2563eb" />,
                        <Cell key={1} fill="#dc2626" />,
                        <Cell key={2} fill={c.netWorth >= 0 ? "#16a34a" : "#f97316"} />,
                      ]}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Liability detail */}
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Liability Breakdown</p>
                  {[
                    { label: "Mortgages", v: c.reMort },
                    { label: "Car Loans", v: carLoan1 + carLoan2 },
                    { label: "Credit Cards", v: cc },
                    { label: "Student Loans", v: studentLoan },
                    { label: "Other Debt", v: otherDebt },
                  ].filter(l => l.v > 0).map((l, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-1">
                      <span className="text-gray-600">{l.label}</span>
                      <span className="text-red-600 font-medium">{fmt(l.v)}</span>
                    </div>
                  ))}
                  {c.totalLiab === 0 && <p className="text-xs text-gray-400">No liabilities entered</p>}
                </div>
              </div>
            </div>

            {/* Real estate detail */}
            {c.reVal > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Real Estate Detail</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {props.filter(p => p.value > 0).map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-semibold text-gray-800 text-sm mb-2">{p.name || `Property ${i + 1}`}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="font-medium">{fmt(p.value)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Mortgage</span><span className="text-red-500 font-medium">{fmt(p.mortgage)}</span></div>
                        <div className="flex justify-between border-t border-gray-200 pt-1"><span className="text-gray-700 font-medium">Equity</span><span className="text-green-700 font-bold">{fmt(p.value - p.mortgage)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: RETIREMENT ────────────────────────────────────────────── */}
        {tab === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatTile label="Years to Retirement" value={c.yrs} bg="bg-blue-50 text-blue-900" />
              <StatTile label="Projected Portfolio" value={fmtShort(c.projPort)} bg="bg-purple-50 text-purple-900" />
              <StatTile label="Target (4% rule)" value={fmtShort(c.portTarget)} bg="bg-yellow-50 text-yellow-900" />
              <StatTile
                label={c.gap >= 0 ? "Projected Surplus" : "Projected Shortfall"}
                value={fmtShort(Math.abs(c.gap))}
                bg={c.gap >= 0 ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}
                sub={c.gap >= 0 ? "You're on track 🎉" : "Consider saving more ⚠️"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Growth chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Portfolio Growth to Retirement</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={c.retChart} margin={{ top: 5, right: 15, bottom: 15, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="age" label={{ value: "Age", position: "insideBottom", offset: -8, fontSize: 11 }} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => fmt(v)} labelFormatter={l => `Age ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="portfolio" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Projected Portfolio" />
                    <Line type="monotone" dataKey="target" stroke="#16a34a" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Post-retirement */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Portfolio Drawdown in Retirement</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={c.postChart} margin={{ top: 5, right: 15, bottom: 15, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="age" label={{ value: "Age", position: "insideBottom", offset: -8, fontSize: 11 }} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => fmt(v)} labelFormatter={l => `Age ${l}`} />
                    <Line type="monotone" dataKey="portfolio" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="Portfolio Balance" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Income summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Retirement Income Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Desired Annual Income</p>
                  <p className="text-lg font-bold text-gray-800">{fmt(retIncome)}</p>
                  <p className="text-xs text-gray-400">in today's dollars</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Social Security (annual)</p>
                  <p className="text-lg font-bold text-gray-800">{fmt(ssMo * 12)}</p>
                  <p className="text-xs text-gray-400">${ssMo.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Needed from Portfolio</p>
                  <p className="text-lg font-bold text-gray-800">{fmt(Math.max(0, retIncome - ssMo * 12))}</p>
                  <p className="text-xs text-gray-400">annually (4% rule)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Savings Rate</p>
                  <p className="text-lg font-bold text-gray-800">{income > 0 ? ((annSavings / income) * 100).toFixed(1) : 0}%</p>
                  <p className="text-xs text-gray-400">{fmt(annSavings)}/yr saved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: COLLEGE ───────────────────────────────────────────────── */}
        {tab === 3 && (
          <div className="space-y-4">
            {c.collegeResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <p className="text-5xl mb-4">🎓</p>
                <p className="text-gray-500 text-lg font-medium">No children added yet</p>
                <p className="text-gray-400 text-sm mt-2">Go to the Inputs tab → College Savings and enable children</p>
              </div>
            ) : (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {c.collegeResults.map((kid, i) => (
                    <StatTile key={i} label={kid.name}
                      value={`${kid.pct}% funded`}
                      sub={`${kid.ytc} yrs to college`}
                      bg={kid.pct >= 100 ? "bg-green-50 text-green-900" : kid.pct >= 60 ? "bg-yellow-50 text-yellow-900" : "bg-red-50 text-red-900"} />
                  ))}
                </div>

                {/* Detail cards */}
                {c.collegeResults.map((kid, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-800">{kid.name}</h3>
                      <span className="text-sm text-gray-500">Age {kid.age} · {kid.ytc} years until college</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      <StatTile label="Projected 529 Balance" value={fmtShort(kid.proj)} bg="bg-blue-50 text-blue-900" />
                      <StatTile label="Projected Total Cost" value={fmtShort(kid.cost)} bg="bg-orange-50 text-orange-900" />
                      <StatTile
                        label={kid.gap >= 0 ? "Surplus" : "Shortfall"}
                        value={fmtShort(Math.abs(kid.gap))}
                        bg={kid.gap >= 0 ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"} />
                      <StatTile label="Funding Progress" value={`${kid.pct}%`}
                        bg={kid.pct >= 100 ? "bg-green-50 text-green-900" : "bg-purple-50 text-purple-900"} />
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Funding progress</span>
                        <span className="font-medium">{fmt(kid.proj)} of {fmt(kid.cost)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full transition-all duration-500 ${kid.pct >= 100 ? 'bg-green-500' : kid.pct >= 75 ? 'bg-blue-500' : kid.pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(100, kid.pct)}%` }}
                        />
                      </div>
                      {kid.gap < 0 && (
                        <p className="text-xs text-red-500 mt-1.5">
                          Monthly contribution needed to close gap: ~{fmt(Math.abs(kid.gap) / (kid.ytc * 12))}/mo additional
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
