"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import JsonEvidence from "@/components/JsonEvidence";

type Store = {
  resources: Record<string, any>;
  fetchedAt: Record<string, string>;
  signals: any[];
  notes: any[];
  lastCallAt?: string;
  lastCallResource?: string;
};

const resources = [
  ["me", "Identity / game status"],
  ["export", "Accounts, people, deals and offers"],
  ["schema", "Data schema"],
  ["accountA", "Account A paperwork"],
  ["accountB", "Account B paperwork"],
  ["signals", "Live events"],
  ["notes", "Saved notes"],
] as const;

const actions = [
  {
    rank: 1,
    account: "A",
    deal: "Tarn Valley and Norwold go live",
    owner: "CSM (you)",
    when: "Before the next customer decision meeting; exact date not available",
    task: "Bring Fatima Osei and Rhys Calder into one meeting to agree the cleared blocker and the next decision.",
    why: "The deal is reported as blocker-cleared ($142,302), but the decision-maker and payer have not been brought together.",
    evidence: "Morning feedback: what would have moved the Tarn Valley and Norwold deal.",
  },
  {
    rank: 2,
    account: "A",
    deal: "Renew the alliance contract (35 docks)",
    owner: "CSM (you)",
    when: "Before proposal review; exact date not available",
    task: "Prepare and send Rhys Calder a proposal using exactly flight_log_force_month and km_usage_1 from Karen Mbeki.",
    why: "Reported as qualified ($136,361); evidence was held but the proposal was not sent.",
    evidence: "Morning feedback: required evidence list for the 35-dock renewal.",
  },
  {
    rank: 3,
    account: "A",
    deal: "Scale Westmere's fleet",
    owner: "CSM (you)",
    when: "Before Metro Central finance decision; exact date not available",
    task: "Send Ewan Brooks a proposal with helicopter_cost_overtime, flight_log_force_month and km_staff_2 from Karen Mbeki.",
    why: "Reported as qualified ($69,913); proposal not sent and flagged at risk after an early offer.",
    evidence: "Morning feedback: required evidence list and risk note.",
  },
  {
    rank: 4,
    account: "B",
    deal: "Bring the idle plants into regular patrol",
    owner: "CSM (you), with Owen Fitch for network evidence",
    when: "After validating the three required evidence items",
    task: "Collect network_plan, plant7_checklist and of_offer_3 from Owen Fitch, then prepare a proposal.",
    why: "Reported as qualified ($31,500); three evidence pieces are missing.",
    evidence: "Morning feedback: required evidence list for the idle-plants opportunity.",
  },
  {
    rank: 5,
    account: "B",
    deal: "Renew the Aldermoor contract (14 docks)",
    owner: "CSM (you), Nadia Rahman for finance validation",
    when: "Before any renewal proposal; exact date not available",
    task: "Ask Nadia Rahman what measured plant-level evidence Finance will accept to verify the claimed savings.",
    why: "Reported as identified ($3,308); Finance cannot verify the savings claim. The opportunity is flagged at risk after an early offer.",
    evidence: "Morning feedback: deal blocker and risk note.",
  },
  {
    rank: 6,
    account: "A",
    deal: "Position for the 300-dock framework tender",
    owner: "CSM (you), Hannah Doyle for procurement process",
    when: "Before the tender specification locks; exact date not available",
    task: "Obtain draft_tender_spec and clarification_template, plus km_staff_2 from Karen Mbeki, before preparing the proposal to Hannah.",
    why: "Reported as qualified ($359,560), but two evidence pieces are missing.",
    evidence: "Morning feedback: required evidence list for the framework tender.",
  },
  {
    rank: 7,
    account: "B",
    deal: "Protect and extend the insurance discount",
    owner: "CSM (you); Julian Tate or Nadia Rahman to validate",
    when: "After the first conversation with the insurance/risk owner",
    task: "Meet Julian Tate, who has not yet been met, or Nadia Rahman to establish the opportunity and its evidence requirements.",
    why: "Not yet heard of; morning feedback says it may involve Julian Tate or Nadia Rahman. An early offer has put it at risk.",
    evidence: "Morning feedback: discovery instruction and risk note.",
  },
  {
    rank: 8,
    account: "B",
    deal: "Case study for the 40-plant sister company",
    owner: "CSM (you), Stefan Roy and plant stakeholders",
    when: "After independently validating site outcomes",
    task: "Revisit Stefan Roy and corroborate plant-level outcomes with Beatriz Alonso, Nadia Rahman or Julian Tate.",
    why: "Not yet heard of. The savings claim is not independently verified, and the sister-company opportunity has no validated value.",
    evidence: "Morning feedback: case-study discovery instruction.",
  },
];

const book = [
  {
    account: "A",
    name: "Renew the alliance contract (35 docks)",
    stage: "Qualified",
    value: "$136,361",
    status: "Evidence held; proposal not sent",
    risk: "Not flagged at risk in the morning summary",
  },
  {
    account: "A",
    name: "Tarn Valley and Norwold go live",
    stage: "Blocker cleared",
    value: "$142,302",
    status: "Decision-maker and payer meeting not arranged",
    risk: "Decision process not confirmed",
  },
  {
    account: "A",
    name: "Scale Westmere's fleet",
    stage: "Qualified",
    value: "$69,913",
    status: "Evidence held; proposal not sent",
    risk: "Early offer; finance evidence required",
  },
  {
    account: "A",
    name: "Position for the 300-dock framework tender",
    stage: "Qualified",
    value: "$359,560",
    status: "Two evidence pieces missing",
    risk: "Tender specification and timetable not confirmed",
  },
  {
    account: "B",
    name: "Renew the Aldermoor contract (14 docks)",
    stage: "Identified",
    value: "$3,308",
    status: "Finance cannot verify claimed savings",
    risk: "Early offer; evidence required",
  },
  {
    account: "B",
    name: "Bring the idle plants into regular patrol",
    stage: "Qualified",
    value: "$31,500",
    status: "Three evidence pieces missing",
    risk: "Network and operating evidence required",
  },
  {
    account: "B",
    name: "Protect and extend the insurance discount",
    stage: "Not heard of",
    value: "Not validated",
    status: "Discovery required",
    risk: "Early offer; do not push another offer yet",
  },
  {
    account: "B",
    name: "Case study for the 40-plant sister company",
    stage: "Not heard of",
    value: "Not validated",
    status: "Validate site outcomes first",
    risk: "Savings claim is not verified",
  },
];

const money = (value: string) => value;

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSignalId(signal: any) {
  return (
    signal?.id ??
    signal?.signal_id ??
    signal?.type ??
    signal?.signal_type ??
    ""
  )
    .toString()
    .toLowerCase();
}

function getSignalPath(signal: any) {
  return (
    signal?.path ??
    signal?.source_path ??
    signal?.file ??
    signal?.source ??
    ""
  );
}

function getPriority(signal: any) {
  const id = getSignalId(signal);
  if (id.includes("urgent_request")) return 1;
  if (id.includes("champion_leaves")) return 2;
  return 3;
}

function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </section>
  );
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-detail">{detail}</div>}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [store, setStore] = useState<Store>({
    resources: {},
    fetchedAt: {},
    signals: [],
    notes: [],
  });
  const [loading, setLoading] = useState(false);
  const [syncingResource, setSyncingResource] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteKind, setNoteKind] = useState("customer");
  const [noteAccount, setNoteAccount] = useState("A");
  const [savingNote, setSavingNote] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const refreshState = async () => {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setStore({
        resources: data.resources ?? {},
        fetchedAt: data.fetchedAt ?? {},
        signals: data.signals ?? [],
        notes: data.notes ?? [],
        lastCallAt: data.lastCallAt,
        lastCallResource: data.lastCallResource,
      });
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (error) {
      console.error("Unable to refresh CRM state", error);
    }
  };

  const fetchResource = async (resource: string, label: string) => {
    if (loading) return;
    setLoading(true);
    setSyncingResource(resource);
    setSyncMessage(`Fetching ${label}...`);
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource }),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        setSyncMessage(data.error ?? `Unable to fetch ${label}. Try again later.`);
      } else {
        setSyncMessage(data.message ?? `${label} fetched successfully.`);
      }
      await refreshState();
    } catch (error) {
      setSyncMessage(`Unable to fetch ${label}. Check the deployment logs.`);
    } finally {
      setLoading(false);
      setSyncingResource(null);
    }
  };

  const syncAll = async () => fetchResource("signals", "Live events");

  const pollSignals = async () => {
    try {
      await fetch("/api/poll-signals", {
        method: "POST",
        cache: "no-store",
      });
      await refreshState();
    } catch (error) {
      console.error("Signal polling failed", error);
    }
  };

  useEffect(() => {
    refreshState();
    const stateTimer = setInterval(refreshState, 15000);
    const signalTimer = setInterval(pollSignals, 60000);
    return () => {
      clearInterval(stateTimer);
      clearInterval(signalTimer);
    };
  }, []);

  const signals = useMemo(() => {
    return [...(store.signals ?? [])].sort(
      (a, b) => getPriority(a) - getPriority(b)
    );
  }, [store.signals]);

  const urgentSignal = signals.find((signal) =>
    getSignalId(signal).includes("urgent_request")
  );
  const championSignal = signals.find((signal) =>
    getSignalId(signal).includes("champion_leaves")
  );

  const liveEventActions = useMemo(() => {
    const result: {
      id: string;
      priority: number;
      title: string;
      account: string;
      detail: string;
      nextStep: string;
      evidence: string;
      sourceDate: string;
      sourcePath: string;
    }[] = [];

    if (urgentSignal) {
      result.push({
        id: "urgent_request",
        priority: 1,
        title: "Westmere public event: urgent written response",
        account: "A",
        detail:
          "Karen Mbeki needs written confirmation this week of operator training dates and who will answer if a dock fails during the 5 December public event. Ticket FB-11206 is open and has no assigned owner.",
        nextStep:
          "Confirm training capacity and dates with the training owner. Confirm the actual event-day support contact and response time with the support owner. Then reply to Karen in writing. Do not promise coverage until internally confirmed.",
        evidence: "FB-11206 · A/emails/2026-11-18_karen_event.txt",
        sourceDate: "18 Nov 2026",
        sourcePath: getSignalPath(urgentSignal),
      });
    }

    if (championSignal) {
      result.push({
        id: "champion_leaves",
        priority: 2,
        title: "Rhys Calder is moving on: relationship handover risk",
        account: "A",
        detail:
          "Rhys says he is moving to another role in the new year and will hand over the drone programme in January. No successor is named. Calls on file were with him alone.",
        nextStep:
          "Ask Rhys for a structured handover and successor name. Until January, route material through the programme office as he requested. Build direct working relationships with Karen, Fatima, Ewan and Hannah.",
        evidence: "A/emails/2026-11-17_rhys_moving.txt",
        sourceDate: "17 Nov 2026",
        sourcePath: getSignalPath(championSignal),
      });
    }

    return result;
  }, [urgentSignal, championSignal]);

  const dynamicRisks = useMemo(() => {
    const result: {
      title: string;
      detail: string;
      tone: "red" | "amber";
    }[] = [];

    if (urgentSignal) {
      result.push({
        title: "Westmere public event request is unanswered",
        detail:
          "FB-11206 is open and unassigned. Training dates and event-day support ownership need written confirmation.",
        tone: "red",
      });
    }

    if (championSignal) {
      result.push({
        title: "Single-threaded relationship at Eastern Counties",
        detail:
          "Rhys Calder is leaving in January. No successor is named and he has been the only person on calls.",
        tone: "amber",
      });
    }

    return result;
  }, [urgentSignal, championSignal]);

  const unknowns = useMemo(() => {
    const result = [
      "The exact tender specification lock date and evaluation method for the 300-dock framework are not confirmed.",
      "The 30-dock Westmere stadium request is not a formal order and has no written quote.",
      "No verified drone cost-per-flight figure is available; do not claim drones are cheaper than helicopters.",
      "The claimed £1.2m savings for Account B has no supporting breakdown and must not be repeated as fact.",
      "The account B per-plant cost breakdown requested by Group Finance remains open.",
    ];

    if (urgentSignal) {
      result.unshift(
        "Who will provide operator training, what dates are available, and who will answer event-day dock failures for 5 December? Internal confirmation is still required."
      );
    }

    if (championSignal) {
      result.unshift(
        "Who will replace Rhys Calder as the Eastern Counties programme contact? No successor is named in the signal."
      );
    }

    return result;
  }, [urgentSignal, championSignal]);

  const firstActions = useMemo(() => {
    return [
      ...liveEventActions.map((item) => ({
        id: item.id,
        rank: item.priority,
        account: item.account,
        deal: item.title,
        owner: "CSM (you)",
        when:
          item.id === "urgent_request"
            ? "This week; before the 5 December public event"
            : "Before Rhys hands over the programme in January",
        task: item.nextStep,
        why: item.detail,
        evidence: item.evidence,
        live: true,
      })),
      ...actions.map((item) => ({
        ...item,
        id: `morning-${item.rank}`,
        live: false,
      })),
    ];
  }, [liveEventActions]);

  const saveNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteText.trim()) return;

    setSavingNote(true);
    setSyncMessage("Saving note...");
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: noteAccount,
          kind: noteKind,
          title: noteTitle,
          text: noteText,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setSyncMessage(data.error ?? "Unable to save note.");
      } else {
        setSyncMessage("Note saved successfully.");
        setNoteText("");
        setNoteTitle("");
        await refreshState();
      }
    } catch (error) {
      setSyncMessage("Unable to save note. Check the server terminal.");
    } finally {
      setSavingNote(false);
    }
  };

  const evidenceData = store.resources ?? {};
  const loadedCount = Object.keys(evidenceData).filter(
    (key) => evidenceData[key] !== undefined && evidenceData[key] !== null
  ).length;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">FlytBase</div>
            <div className="brand-subtitle">Customer Success CRM</div>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="nav-list">
          <button
            className={activeTab === "overview" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("overview")}
          >
            <span className="nav-icon">▦</span>
            Overview
          </button>
          <button
            className={activeTab === "evidence" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("evidence")}
          >
            <span className="nav-icon">◫</span>
            Evidence
          </button>
          <button
            className={activeTab === "actions" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("actions")}
          >
            <span className="nav-icon">✓</span>
            Action plan
          </button>
          <button
            className={activeTab === "handin" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("handin")}
          >
            <span className="nav-icon">↗</span>
            Hand-in
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">DATA CONNECTION</div>
          <div className="connection-card">
            <span className="connection-dot" />
            <div>
              <strong>Questathon API</strong>
              <small>Server-side connection</small>
            </div>
          </div>
          <small className="sidebar-footnote">
            Internal working CRM · Verify source records before customer
            commitments.
          </small>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <div className="eyebrow">QUESTATHON · CUSTOMER SUCCESS</div>
            <h1>Account command centre</h1>
            <p className="topbar-subtitle">
              Two accounts · evidence-led decisions · live event monitoring
            </p>
          </div>
          <div className="topbar-actions">
            <div className="updated-label">
              <span className="connection-dot" />
              {lastUpdated ? `Updated ${lastUpdated}` : "Connecting..."}
            </div>
            <button className="primary-button" onClick={syncAll} disabled={loading}>
              {loading ? "Refreshing..." : "↻ Refresh data"}
            </button>
          </div>
        </header>

        {syncMessage && (
          <div className="notice" role="status">
            {syncMessage}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="page-content">
            <div className="section-heading">
              <div>
                <h2>Portfolio overview</h2>
                <p>
                  Morning pipeline snapshot with newly detected live events.
                  Verify figures against source records before reporting them.
                </p>
              </div>
              <Pill tone="blue">2 accounts monitored</Pill>
            </div>

            <div className="stats-grid">
              <Stat
                label="Morning pipeline snapshot"
                value="$847,944"
                detail="Provisional value; not verified booked revenue"
              />
              <Stat
                label="Opportunities"
                value="8"
                detail="Four in Account A · four in Account B"
              />
              <Stat
                label="Live events"
                value={String(signals.length)}
                detail="Signals received from the live feed"
              />
              <Stat
                label="Source records loaded"
                value={String(loadedCount)}
                detail="Cached API resources"
              />
            </div>

            <div className="two-column">
              <Card title="Live events requiring attention">
                {liveEventActions.length === 0 ? (
                  <div className="empty-state">
                    No matching live events are currently stored. Refresh data
                    to check the signal feed.
                  </div>
                ) : (
                  <div className="event-list">
                    {liveEventActions.map((item) => (
                      <article className="event-item" key={item.id}>
                        <div className="event-topline">
                          <Pill tone={item.priority === 1 ? "red" : "amber"}>
                            Priority {item.priority}
                          </Pill>
                          <span className="event-date">
                            Source date: {item.sourceDate}
                          </span>
                        </div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                        <div className="event-next">
                          <strong>Next action</strong>
                          <p>{item.nextStep}</p>
                        </div>
                        <div className="source-line">
                          Source: {item.evidence}
                        </div>
                      </article>
                    ))}
                    <p className="footnote">
                      These signals were surfaced by the system on 14 Nov
                      2026. Their source dates are 17 and 18 Nov 2026, so do
                      not describe those source events as already having
                      occurred.
                    </p>
                  </div>
                )}
              </Card>

              <Card title="Priority risks">
                <div className="risk-list">
                  {dynamicRisks.map((risk, index) => (
                    <div className="risk-item" key={`${risk.title}-${index}`}>
                      <Pill tone={risk.tone}>
                        {risk.tone === "red" ? "Urgent" : "At risk"}
                      </Pill>
                      <div>
                        <strong>{risk.title}</strong>
                        <p>{risk.detail}</p>
                      </div>
                    </div>
                  ))}
                  <div className="risk-item">
                    <Pill tone="amber">Account A</Pill>
                    <div>
                      <strong>Tender evidence is incomplete</strong>
                      <p>
                        The 300-dock framework needs a written specification,
                        clarification template and costed operating model.
                      </p>
                    </div>
                  </div>
                  <div className="risk-item">
                    <Pill tone="amber">Account B</Pill>
                    <div>
                      <strong>Renewal value needs finance validation</strong>
                      <p>
                        Group Finance requested a per-plant cost breakdown.
                        The savings claim is not independently verified.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card title="Pipeline snapshot">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Opportunity</th>
                      <th>Stage</th>
                      <th>Value</th>
                      <th>Current position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.map((item) => (
                      <tr key={`${item.account}-${item.name}`}>
                        <td>
                          <Pill tone={item.account === "A" ? "blue" : "neutral"}>
                            Account {item.account}
                          </Pill>
                        </td>
                        <td className="table-primary">{item.name}</td>
                        <td>{item.stage}</td>
                        <td className="value-cell">{money(item.value)}</td>
                        <td>
                          <div>{item.status}</div>
                          <small className="muted">{item.risk}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="footnote">
                Pipeline figures above are from the morning snapshot and are
                not confirmed as booked revenue or forecast. Account B's
                existing annual contract (€140,000) is a separate renewal
                exposure, not new expansion value.
              </p>
            </Card>

            <div className="two-column">
              <Card title="First actions">
                <div className="action-list compact">
                  {firstActions.slice(0, 5).map((item) => (
                    <div className="action-row" key={item.id}>
                      <div className="action-number">{item.rank}</div>
                      <div className="action-copy">
                        <div className="action-title-row">
                          <strong>{item.deal}</strong>
                          {item.live && <Pill tone="red">Live event</Pill>}
                        </div>
                        <p>{item.task}</p>
                        <small>{item.when}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="text-button"
                  onClick={() => setActiveTab("actions")}
                >
                  View complete action plan →
                </button>
              </Card>

              <Card title="Important unknowns">
                <ul className="unknown-list">
                  {unknowns.slice(0, 6).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="page-content">
            <div className="section-heading">
              <div>
                <h2>Evidence room</h2>
                <p>
                  Cached source responses from the Questathon API. Fetch each
                  resource separately; the API allows one upstream request per
                  minute. Use the source record as the authority.
                </p>
              </div>
              <Pill tone="blue">{loadedCount} resources loaded</Pill>
            </div>

            <div className="resource-grid">
              {resources.map(([key, label]) => (
                <div className="resource-card" key={key}>
                  <div className="resource-header">
                    <div>
                      <strong>{label}</strong>
                      <small>
                        {store.fetchedAt[key]
                          ? `Fetched ${formatDate(store.fetchedAt[key])}`
                          : "Not fetched yet"}
                      </small>
                    </div>
                    <Pill
                      tone={evidenceData[key] ? "green" : "neutral"}
                    >
                      {evidenceData[key] ? "Loaded" : "Waiting"}
                    </Pill>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => fetchResource(key, label)}
                    disabled={loading}
                  >
                    {syncingResource === key ? "Fetching..." : evidenceData[key] ? "Fetch again" : "Fetch resource"}
                  </button>
                  {evidenceData[key] ? (
                    <JsonEvidence title={label} data={evidenceData[key]} />
                  ) : (
                    <div className="empty-state">
                      No cached response yet. Select Fetch resource above.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="page-content">
            <div className="section-heading">
              <div>
                <h2>Action plan</h2>
                <p>
                  Prioritised next steps. A detected event is not marked
                  complete until the action is independently verified.
                </p>
              </div>
              <Pill tone="amber">Evidence-led execution</Pill>
            </div>

            {liveEventActions.length > 0 && (
              <Card title="Immediate priorities from live signals">
                <div className="action-list">
                  {liveEventActions.map((item) => (
                    <article className="priority-card" key={item.id}>
                      <div className="priority-card-head">
                        <Pill tone={item.priority === 1 ? "red" : "amber"}>
                          Priority {item.priority}
                        </Pill>
                        <span className="muted">
                          Account {item.account} · Detected · action not yet
                          confirmed complete
                        </span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                      <div className="action-next-box">
                        <strong>Recommended next step</strong>
                        <p>{item.nextStep}</p>
                      </div>
                      <small className="muted">
                        Evidence: {item.evidence}
                      </small>
                    </article>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Morning action plan">
              <div className="action-list">
                {actions.map((item) => (
                  <article className="action-row detailed" key={item.rank}>
                    <div className="action-number">{item.rank}</div>
                    <div className="action-copy">
                      <div className="action-title-row">
                        <strong>{item.deal}</strong>
                        <Pill tone={item.account === "A" ? "blue" : "neutral"}>
                          Account {item.account}
                        </Pill>
                      </div>
                      <p>{item.task}</p>
                      <div className="action-meta-grid">
                        <div>
                          <small>Owner</small>
                          <span>{item.owner}</span>
                        </div>
                        <div>
                          <small>Timing</small>
                          <span>{item.when}</span>
                        </div>
                        <div>
                          <small>Why this matters</small>
                          <span>{item.why}</span>
                        </div>
                        <div>
                          <small>Evidence reference</small>
                          <span>{item.evidence}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Card>

            <Card title="Open questions before making commitments">
              <ul className="unknown-list">
                {unknowns.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card title="Record a customer-success note">
              <p className="muted">
                Save a note to the Questathon workspace. Do not include
                credentials or confidential information that is not needed.
              </p>
              <form className="note-form" onSubmit={saveNote}>
                <div className="form-grid">
                  <label>
                    Account
                    <select
                      value={noteAccount}
                      onChange={(event) => setNoteAccount(event.target.value)}
                    >
                      <option value="A">Account A</option>
                      <option value="B">Account B</option>
                    </select>
                  </label>
                  <label>
                    Note type
                    <select
                      value={noteKind}
                      onChange={(event) => setNoteKind(event.target.value)}
                    >
                      <option value="customer">Customer</option>
                      <option value="internal">Internal</option>
                      <option value="risk">Risk</option>
                      <option value="action">Action</option>
                    </select>
                  </label>
                </div>
                <label>
                  Title
                  <input
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Short note title"
                  />
                </label>
                <label>
                  Note
                  <textarea
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    placeholder="Write the note and supporting context..."
                    rows={5}
                    required
                  />
                </label>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={savingNote || !noteText.trim()}
                >
                  {savingNote ? "Saving..." : "Save note"}
                </button>
              </form>
            </Card>

            <Card title="Saved notes">
              {store.notes.length === 0 ? (
                <div className="empty-state">
                  No notes returned by the API yet.
                </div>
              ) : (
                <div className="saved-notes">
                  {store.notes.map((note: any, index: number) => (
                    <article className="saved-note" key={note.id ?? index}>
                      <div className="saved-note-head">
                        <strong>{note.title ?? "Untitled note"}</strong>
                        <Pill>{note.account ?? "Account"}</Pill>
                      </div>
                      <p>{note.text ?? note.content ?? ""}</p>
                      <small className="muted">
                        {note.created_at
                          ? formatDate(note.created_at)
                          : "Saved note"}
                      </small>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "handin" && (
          <div className="page-content">
            <div className="section-heading">
              <div>
                <h2>Questathon hand-in</h2>
                <p>
                  Prepare the four required deliverables. Verify each link
                  from a private browser window before submission.
                </p>
              </div>
              <Pill tone="amber">Submission checklist</Pill>
            </div>

            <div className="handin-grid">
              <Card title="1 · Hosted live CRM">
                <p>
                  Deploy the Next.js application to a public URL. Confirm that
                  the dashboard loads without your development laptop.
                </p>
                <ul>
                  <li>Set AQ_TOKEN as a server-side hosting secret.</li>
                  <li>Never expose the token in browser code or GitHub.</li>
                  <li>Use persistent storage for the app's JSON data.</li>
                  <li>Test the hosted URL in a private browser window.</li>
                </ul>
                <Pill tone="amber">Deployment required</Pill>
              </Card>

              <Card title="2 · Public Git repository">
                <p>
                  Push the project source to a public GitHub repository.
                  Include a clear README and setup instructions.
                </p>
                <ul>
                  <li>Commit the source code and package files.</li>
                  <li>Keep .env.local out of Git.</li>
                  <li>Include .env.example without real secrets.</li>
                  <li>Check the repository for tokens before publishing.</li>
                </ul>
                <Pill tone="amber">Publish required</Pill>
              </Card>

              <Card title="3 · One-page Google Doc">
                <p>
                  Explain the CRM's purpose, intended audience, decision
                  rules, limitations and how AI was used.
                </p>
                <ul>
                  <li>Explain how live signals change priorities.</li>
                  <li>Distinguish verified facts from assumptions.</li>
                  <li>Describe the source records used.</li>
                  <li>State the limitations honestly.</li>
                </ul>
                <Pill tone="amber">Document required</Pill>
              </Card>

              <Card title="4 · Three-minute demo video">
                <p>
                  Record a concise walkthrough using one account and five
                  questions, then trace one number back to its source.
                </p>
                <ul>
                  <li>Show the live event being picked up.</li>
                  <li>Show five useful account answers.</li>
                  <li>Trace one number to the original evidence.</li>
                  <li>Briefly show the code and explain the logic.</li>
                  <li>Share the Drive video as Anyone with the link.</li>
                </ul>
                <Pill tone="amber">Recording required</Pill>
              </Card>
            </div>

            <Card title="Before you submit">
              <ul className="checklist">
                <li>Hosted URL opens in a private window.</li>
                <li>Dashboard works when your laptop is off.</li>
                <li>GitHub repository is public and contains no token.</li>
                <li>Google Doc is shared with the required access.</li>
                <li>Video is under three minutes and opens from its link.</li>
                <li>All four links are tested before submission.</li>
              </ul>
            </Card>
          </div>
        )}

        <footer className="app-footer">
          <span>FlytBase · Customer Success Command Centre</span>
          <span>
            Live data is cached and refreshed periodically. Detected events
            are not marked complete until verified.
          </span>
        </footer>
      </section>
    </main>
  );
}