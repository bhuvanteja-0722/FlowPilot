import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileWarning,
  Filter,
  HelpCircle,
  Home as HomeIcon,
  LineChart,
  Loader2,
  Menu,
  MoreHorizontal,
  PackageCheck,
  PanelRight,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type TransactionStatus = "Paid" | "Pending" | "Refunded" | "Dispute";
type RiskLevel = "Low" | "Watch" | "High";
type FilterKey = "all" | "inflow" | "outflow" | "risk";
type ActionKind = "refund" | "remind";

interface Transaction {
  id: string;
  customer: string;
  initials: string;
  email: string;
  amount: number;
  fee: number;
  type: "Sale" | "Refund" | "Dispute";
  status: TransactionStatus;
  risk: RiskLevel;
  date: string;
  time: string;
  payout: string;
  item: string;
  note: string;
  color: string;
}

const transactions: Transaction[] = [
  {
    id: "tr_1048",
    customer: "Maya Chen",
    initials: "MC",
    email: "maya.chen@email.com",
    amount: 284,
    fee: 8.54,
    type: "Sale",
    status: "Dispute",
    risk: "High",
    date: "Today",
    time: "09:41",
    payout: "Held · review by Nov 04",
    item: "Studio membership · annual",
    note: "A new dispute was opened 18 minutes ago. The customer has purchased twice before, but the card country differs from the account profile.",
    color: "#e8c9ff",
  },
  {
    id: "tr_1047",
    customer: "Northstar Goods",
    initials: "NG",
    email: "finance@northstar.goods",
    amount: 1250,
    fee: 36.5,
    type: "Sale",
    status: "Pending",
    risk: "Watch",
    date: "Today",
    time: "08:55",
    payout: "Expected · Nov 02",
    item: "Wholesale order · 40 units",
    note: "A larger-than-usual order is awaiting capture. The buyer domain is verified and matches a 7-month-old account.",
    color: "#b9e8d3",
  },
  {
    id: "tr_1046",
    customer: "Leo Martin",
    initials: "LM",
    email: "leo.martin@email.com",
    amount: 96,
    fee: 3.18,
    type: "Sale",
    status: "Paid",
    risk: "Low",
    date: "Yesterday",
    time: "18:20",
    payout: "Settled · Oct 31",
    item: "Product photography preset pack",
    note: "Healthy repeat purchase. Payment, device, and shipping signals are consistent with the customer history.",
    color: "#c7d9ff",
  },
  {
    id: "tr_1045",
    customer: "Ari & Co.",
    initials: "AC",
    email: "hello@ariandco.co",
    amount: -74,
    fee: 0,
    type: "Refund",
    status: "Refunded",
    risk: "Low",
    date: "Yesterday",
    time: "15:08",
    payout: "Returned · Oct 30",
    item: "Consulting deposit",
    note: "Refund completed within the 24-hour service promise. No follow-up required.",
    color: "#ffd8ac",
  },
  {
    id: "tr_1044",
    customer: "Jon Bell",
    initials: "JB",
    email: "jon.bell@email.com",
    amount: 430,
    fee: 12.82,
    type: "Sale",
    status: "Paid",
    risk: "Watch",
    date: "Oct 30",
    time: "11:36",
    payout: "Settled · Oct 31",
    item: "Brand strategy sprint",
    note: "Above the account's median purchase size. Customer history is strong, so this is watch-only rather than a block.",
    color: "#ffe5a8",
  },
  {
    id: "tr_1043",
    customer: "Rene Studio",
    initials: "RS",
    email: "team@renestudio.io",
    amount: 680,
    fee: 19.72,
    type: "Sale",
    status: "Paid",
    risk: "Low",
    date: "Oct 30",
    time: "10:14",
    payout: "Settled · Oct 31",
    item: "Design system audit",
    note: "Payment follows the agreed invoice amount and a verified business profile.",
    color: "#c3f0ef",
  },
];

const navItems = [
  { label: "Overview", icon: HomeIcon, count: undefined },
  { label: "Transactions", icon: CreditCard, count: "24" },
  { label: "Insights", icon: Sparkles, count: "3" },
];

function formatCurrency(value: number) {
  return `${value < 0 ? "−" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge risk-${risk.toLowerCase()}`}>{risk}</span>;
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const Icon = status === "Paid" ? Check : status === "Dispute" ? AlertTriangle : status === "Pending" ? Clock3 : RefreshCcw;
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <Icon size={12} /> {status}
    </span>
  );
}

function AppMark() {
  return (
    <div className="app-mark" aria-label="FlowPilot">
      <span className="pilot-dot" />
      <span className="pilot-slash" />
      <span className="mark-word">flowpilot</span>
    </div>
  );
}

function MiniChart() {
  return (
    <div className="mini-chart" aria-label="Cash flow trending up">
      <div className="chart-gridline gridline-one" />
      <div className="chart-gridline gridline-two" />
      <div className="chart-area" />
      <svg viewBox="0 0 520 156" preserveAspectRatio="none" className="chart-svg" role="img" aria-label="Cash flow line chart">
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2367ff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2367ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 122 C42 114, 54 124, 82 101 S128 106, 152 84 S194 94, 218 77 S258 91, 288 65 S325 76, 350 53 S397 69, 420 42 S468 51, 520 20 L520 156 L0 156 Z" fill="url(#lineFill)" />
        <path d="M0 122 C42 114, 54 124, 82 101 S128 106, 152 84 S194 94, 218 77 S258 91, 288 65 S325 76, 350 53 S397 69, 420 42 S468 51, 520 20" fill="none" stroke="#2367ff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="420" cy="42" r="5" fill="#f7f4ed" stroke="#2367ff" strokeWidth="3" />
      </svg>
      <div className="chart-axis"><span>Oct 25</span><span>Oct 28</span><span>Today</span></div>
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<"Overview" | "Transactions" | "Insights">("Overview");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState("tr_1048");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionKind, setActionKind] = useState<ActionKind>("refund");
  const [actionState, setActionState] = useState<"idle" | "running" | "success">("idle");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [connected, setConnected] = useState(true);

  const selectedTransaction = transactions.find((transaction) => transaction.id === selectedId) ?? transactions[0];

  const filteredTransactions = useMemo(() => {
    if (filter === "inflow") return transactions.filter((transaction) => transaction.amount > 0);
    if (filter === "outflow") return transactions.filter((transaction) => transaction.amount < 0);
    if (filter === "risk") return transactions.filter((transaction) => transaction.risk !== "Low");
    return transactions;
  }, [filter]);

  function selectTransaction(transaction: Transaction) {
    setSelectedId(transaction.id);
    setDrawerOpen(true);
    setActionState("idle");
  }

  function openAction(kind: ActionKind) {
    setActionKind(kind);
    setActionState("idle");
    setDrawerOpen(true);
  }

  function completeAction() {
    setActionState("running");
    window.setTimeout(() => setActionState("success"), 900);
  }

  const isOverview = activeView === "Overview";
  const isTransactions = activeView === "Transactions";
  const isInsights = activeView === "Insights";

  return (
    <div className="flowpilot-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <AppMark />
          <button className="sidebar-close mobile-only" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy"><strong>Northstar Studio</strong><span>Business workspace</span></div>
          <ChevronRight size={15} className="workspace-chevron" />
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`nav-item ${activeView === item.label ? "nav-active" : ""}`}
                onClick={() => { setActiveView(item.label as typeof activeView); setMobileNavOpen(false); }}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.count && <span className="nav-count">{item.count}</span>}
              </button>
            );
          })}
          <p className="nav-label nav-label-spaced">Manage</p>
          <button className="nav-item" onClick={() => setConnected((value) => !value)}><WalletCards size={17} strokeWidth={1.8} /><span>PayPal connection</span><span className={`connection-dot ${connected ? "online" : "offline"}`} /></button>
          <button className="nav-item" onClick={() => alert("Team controls are coming in the live workspace.")}><Users size={17} strokeWidth={1.8} /><span>Team</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="pilot-status"><span className="pilot-status-dot" /><div><strong>AI pilot is on</strong><span>Watching 24 payments</span></div><MoreHorizontal size={15} /></div>
          <button className="help-link"><HelpCircle size={16} /><span>Help center</span><span className="shortcut">?</span></button>
          <div className="user-row"><div className="user-avatar">SJ</div><div><strong>Sam Jordan</strong><span>Owner</span></div><MoreHorizontal size={16} /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-scrim mobile-only" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />}

      <main className="main-stage">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu mobile-only" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Northstar Studio</span><ChevronRight size={14} /><strong>{activeView}</strong></div></div>
          <div className="topbar-actions"><div className="sync-label"><span className="sync-dot" /> Synced 2 min ago</div><button className="icon-button" title="Notifications"><Bell size={18} /></button><div className="topbar-avatar">SJ</div></div>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> Thursday, October 31, 2026</div><h1>{isOverview ? "Good morning, Sam." : activeView}</h1><p>{isOverview ? "Here’s the money moment for Northstar Studio." : isTransactions ? "Every payment, refund, and dispute in one clear view." : "Your AI pilot’s read on what deserves attention next."}</p></div>
            <div className="heading-actions"><button className="date-button"><CalendarClock size={16} /> Last 7 days <ChevronRight size={14} /></button><button className="primary-button" onClick={() => openAction("remind")}><Sparkles size={16} /> Ask FlowPilot</button></div>
          </section>

          <div className="connection-banner"><div className="banner-icon"><ShieldCheck size={17} /></div><div><strong>{connected ? "PayPal sandbox connected" : "PayPal sandbox paused"}</strong><span>{connected ? "Demo data is synced and ready for review." : "Reconnect to resume payment monitoring."}</span></div><button onClick={() => setConnected((value) => !value)}>{connected ? "Manage" : "Reconnect"}<ChevronRight size={14} /></button></div>

          {isOverview && <>
            <section className="metric-grid" aria-label="Key metrics">
              <article className="metric-card metric-card-primary"><div className="metric-top"><span>Available cash</span><CircleDollarSign size={17} /></div><div className="metric-value">$8,426<span>.18</span></div><div className="metric-meta positive"><TrendingUp size={14} /> 12.4% <em>vs. last 7 days</em></div><div className="metric-footnote">Next payout <strong>$1,930.42</strong> · tomorrow</div></article>
              <article className="metric-card"><div className="metric-top"><span>Money in</span><ArrowDownRight size={17} /></div><div className="metric-value">$12,840<span>.60</span></div><div className="metric-meta positive"><TrendingUp size={14} /> 8.2% <em>vs. last 7 days</em></div><div className="metric-footnote">24 payments <strong>processed</strong></div></article>
              <article className="metric-card"><div className="metric-top"><span>Needs attention</span><AlertTriangle size={17} /></div><div className="metric-value metric-risk">3</div><div className="metric-meta warning"><span className="metric-dot" /> $1,534.00 at risk</div><div className="metric-footnote">1 dispute · 2 unusual payments</div></article>
              <article className="metric-card"><div className="metric-top"><span>Payout health</span><PackageCheck size={17} /></div><div className="metric-value">98<span>%</span></div><div className="metric-meta positive"><Check size={14} /> On track <em>this month</em></div><div className="metric-footnote">Last settled <strong>Oct 31, 9:12 AM</strong></div></article>
            </section>

            <section className="brief-grid">
              <article className="ai-brief-panel">
                <div className="panel-heading"><div className="panel-title"><span className="ai-orb"><Sparkles size={15} /></span><div><span className="section-kicker">FlowPilot intelligence</span><h2>Your money, in plain English.</h2></div></div><span className="live-pill"><span /> Live</span></div>
                <p className="brief-lede">I found <strong>3 moments</strong> worth your attention. Your cash position is healthy, but one dispute could delay tomorrow’s payout.</p>
                <div className="insight-stack">
                  <button className="insight-card insight-alert" onClick={() => selectTransaction(transactions[0])}><div className="insight-icon"><FileWarning size={17} /></div><div className="insight-content"><div className="insight-head"><strong>Dispute opened on $284 payment</strong><span>Now</span></div><p>Maya Chen’s payment is on hold. The account looks familiar, but the card country changed.</p><span className="insight-action">Review dispute <ChevronRight size={14} /></span></div></button>
                  <button className="insight-card" onClick={() => selectTransaction(transactions[1])}><div className="insight-icon blue"><TrendingUp size={17} /></div><div className="insight-content"><div className="insight-head"><strong>Wholesale order is 4.2× your median</strong><span>8m ago</span></div><p>Northstar Goods is verified. Capture is safe, but I’d keep an eye on delivery confirmation.</p><span className="insight-action">View payment <ChevronRight size={14} /></span></div></button>
                </div>
                <button className="text-button" onClick={() => setActiveView("Insights")}>See all insights <ArrowUpRight size={14} /></button>
              </article>

              <article className="cashflow-panel">
                <div className="panel-heading"><div><span className="section-kicker">Cash flow</span><h2>Moving in the right direction.</h2></div><button className="more-button"><MoreHorizontal size={18} /></button></div>
                <div className="cashflow-number"><strong>$12,840.60</strong><span>inflow this week</span></div><MiniChart />
                <div className="cashflow-legend"><span><i className="legend-dot blue-dot" /> Money in <strong>$12,840</strong></span><span><i className="legend-dot orange-dot" /> Money out <strong>$1,728</strong></span></div>
              </article>
            </section>
          </>}

          {isInsights && <section className="insights-page"><div className="insights-hero"><div className="ai-orb large"><Sparkles size={24} /></div><div><span className="section-kicker">FlowPilot intelligence</span><h2>Three moments worth your attention.</h2><p>Reasoned from 24 PayPal payments, payout timing, and your recent customer patterns.</p></div></div><div className="insight-page-grid"><button className="insight-page-card alert-border" onClick={() => selectTransaction(transactions[0])}><span className="card-index">01</span><AlertTriangle size={19} /><h3>Protect tomorrow’s payout</h3><p>The $284 dispute from Maya Chen is the only item currently holding funds. Review the evidence before the dispute window closes.</p><span className="insight-action">Open payment <ChevronRight size={14} /></span></button><button className="insight-page-card blue-border" onClick={() => selectTransaction(transactions[1])}><span className="card-index">02</span><TrendingUp size={19} /><h3>Capture the wholesale order</h3><p>Northstar Goods is verified, and the $1,250 order matches a known business email. Capturing it keeps the payout forecast on track.</p><span className="insight-action">View order <ChevronRight size={14} /></span></button><button className="insight-page-card green-border" onClick={() => openAction("remind")}><span className="card-index">03</span><Send size={19} /><h3>Close the gentle follow-up</h3><p>Two customers viewed invoices but haven’t completed payment. Send a friendly reminder without changing the amount or due date.</p><span className="insight-action">Draft reminders <ChevronRight size={14} /></span></button></div></section>}

          {(isOverview || isTransactions) && <section className="transactions-section">
            <div className="section-heading-row"><div><span className="section-kicker">Payment intelligence</span><h2>{isOverview ? "Recent activity" : "All transactions"}</h2><p>{isOverview ? "A clear view of where your money is moving." : "Search, filter, and act on PayPal activity."}</p></div><div className="table-actions"><div className="search-box"><Search size={15} /><input aria-label="Search transactions" placeholder="Search payments" /></div><button className="filter-button"><Filter size={15} /> Filter</button></div></div>
            <div className="filter-tabs" role="tablist" aria-label="Transaction filters"><button className={filter === "all" ? "filter-active" : ""} onClick={() => setFilter("all")}>All <span>24</span></button><button className={filter === "inflow" ? "filter-active" : ""} onClick={() => setFilter("inflow")}>Money in <span>21</span></button><button className={filter === "outflow" ? "filter-active" : ""} onClick={() => setFilter("outflow")}>Money out <span>3</span></button><button className={filter === "risk" ? "filter-active" : ""} onClick={() => setFilter("risk")}>Needs attention <span>3</span></button></div>
            <div className="table-wrap"><table><thead><tr><th>Customer / payment</th><th>Amount</th><th>Status</th><th>Risk</th><th>Payout</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{filteredTransactions.map((transaction) => <tr key={transaction.id} className={selectedId === transaction.id ? "row-selected" : ""} onClick={() => selectTransaction(transaction)}><td><div className="customer-cell"><span className="customer-avatar" style={{ background: transaction.color }}>{transaction.initials}</span><div><strong>{transaction.customer}</strong><span>{transaction.item}</span></div></div></td><td><div className={`amount-cell ${transaction.amount < 0 ? "amount-out" : ""}`}>{transaction.amount > 0 && <ArrowDownRight size={13} />}{formatCurrency(transaction.amount)}<span>{transaction.date} · {transaction.time}</span></div></td><td><StatusBadge status={transaction.status} /></td><td><RiskBadge risk={transaction.risk} /></td><td><span className="payout-cell">{transaction.payout}</span></td><td><button className="row-open" aria-label={`Open ${transaction.customer}`} onClick={(event) => { event.stopPropagation(); selectTransaction(transaction); }}><ChevronRight size={16} /></button></td></tr>)}</tbody></table></div>
            <div className="table-footer"><span>Showing {filteredTransactions.length} of 24 payments</span><button className="text-button" onClick={() => setActiveView("Transactions")}>View full ledger <ArrowUpRight size={14} /></button></div>
          </section>}
        </div>
      </main>

      {drawerOpen && <>
        <button className="drawer-scrim" onClick={() => setDrawerOpen(false)} aria-label="Close payment details" />
        <aside className="detail-drawer">
          <div className="drawer-header"><div><span className="section-kicker">Payment detail</span><h2>{selectedTransaction.customer}</h2><span className="drawer-id">{selectedTransaction.id} · PayPal sandbox</span></div><button className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close details"><X size={18} /></button></div>
          <div className="drawer-amount"><span className="amount-label">Payment amount</span><strong>{formatCurrency(selectedTransaction.amount)}</strong><div><StatusBadge status={selectedTransaction.status} /> <RiskBadge risk={selectedTransaction.risk} /></div></div>
          <div className="drawer-section"><span className="section-kicker">FlowPilot read</span><div className="drawer-insight"><span className="ai-orb small"><Sparkles size={13} /></span><p>{selectedTransaction.note}</p></div></div>
          <div className="detail-list"><div><span>Customer</span><strong>{selectedTransaction.email}</strong></div><div><span>Item</span><strong>{selectedTransaction.item}</strong></div><div><span>Processing fee</span><strong>{formatCurrency(selectedTransaction.fee)}</strong></div><div><span>Payout status</span><strong>{selectedTransaction.payout}</strong></div></div>
          <div className="drawer-action-block"><div className="drawer-action-heading"><div><span className="section-kicker">Safe actions</span><h3>What would you like to do?</h3></div><PanelRight size={17} /></div><div className="action-choice-row"><button className={actionKind === "refund" ? "action-choice active" : "action-choice"} onClick={() => { setActionKind("refund"); setActionState("idle"); }}><RefreshCcw size={15} /><span>Review refund</span></button><button className={actionKind === "remind" ? "action-choice active" : "action-choice"} onClick={() => { setActionKind("remind"); setActionState("idle"); }}><Send size={15} /><span>Send reminder</span></button></div>{actionState === "success" ? <div className="action-success"><div className="success-check"><Check size={17} /></div><div><strong>{actionKind === "refund" ? "Refund simulated safely" : "Reminder queued for review"}</strong><p>{actionKind === "refund" ? "No live PayPal call was made. The demo state is ready to show the expected outcome." : "The customer message is drafted without sending anything externally."}</p></div></div> : <><div className="impact-row"><div><span>Expected cash impact</span><strong>{actionKind === "refund" ? `−${formatCurrency(Math.abs(selectedTransaction.amount))}` : "$0.00"}</strong></div><div><span>Safety gate</span><strong><ShieldCheck size={14} /> Review first</strong></div></div><Button className="drawer-primary" onClick={completeAction} disabled={actionState === "running"}>{actionState === "running" ? <><Loader2 size={16} className="spin" /> Preparing safe preview…</> : <>{actionKind === "refund" ? "Preview refund" : "Preview reminder"}<ChevronRight size={15} /></>}</Button><p className="drawer-disclaimer"><ShieldCheck size={13} /> Demo mode: actions never leave this browser.</p></>}</div>
          <div className="drawer-footer"><button className="footer-link"><MoreHorizontal size={15} /> More payment details</button><span>Updated just now</span></div>
        </aside>
      </>}
    </div>
  );
}
