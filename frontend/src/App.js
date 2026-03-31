import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// ── Translations ───────────────────────────────────────────────────────────
const DICTIONARY = {
  English: { dashboard: "Dashboard", compare: "Compare Profiles", tutorial: "Learn GitHub", profile: "My Profile", settings: "Settings", faqs: "FAQs", contact: "Contact Us", terms: "Terms & Conditions", privacy: "Privacy Policy", subscription: "Subscription" },
  Hindi: { dashboard: "डैशबोर्ड", compare: "प्रोफ़ाइल तुलना", tutorial: "गिटहब सीखें", profile: "मेरी प्रोफ़ाइल", settings: "सेटिंग्स", faqs: "सामान्य प्रश्न", contact: "संपर्क करें", terms: "नियम और शर्तें", privacy: "गोपनीयता नीति", subscription: "सदस्यता" },
  Spanish: { dashboard: "Panel", compare: "Comparar Perfiles", tutorial: "Aprender GitHub", profile: "Mi Perfil", settings: "Ajustes", faqs: "Preguntas Frecuentes", contact: "Contáctenos", terms: "Términos y Condiciones", privacy: "Política de Privacidad", subscription: "Suscripción" },
  French: { dashboard: "Tableau de Bord", compare: "Comparer Profils", tutorial: "Apprendre GitHub", profile: "Mon Profil", settings: "Paramètres", faqs: "FAQ", contact: "Nous Contacter", terms: "Conditions d'utilisation", privacy: "Politique de Confidentialité", subscription: "Abonnement" },
};
const tStr = (lang, key) => (DICTIONARY[lang] || DICTIONARY.English)[key] || DICTIONARY.English[key] || key;

// ── Themes ─────────────────────────────────────────────────────────────────
const THEMES = {
  dark:       { name:'Dark',        emoji:'🌑', bg:'#020617',  containerBg:'rgba(15,23,42,0.96)',  cardBg:'rgba(15,23,42,0.95)',  accent:'#38bdf8', accent2:'#6366f1', text:'#e5e7eb', subtext:'#9ca3af', border:'rgba(55,65,81,0.9)',   sidebarBg:'rgba(2,6,23,0.98)',      btnBg:'linear-gradient(135deg,#38bdf8,#0369a1)', animated:false },
  light:      { name:'Light',       emoji:'☀️', bg:'#f1f5f9',  containerBg:'rgba(249,250,251,0.96)',cardBg:'rgba(241,245,249,0.95)',accent:'#2563eb', accent2:'#7c3aed', text:'#111827', subtext:'#6b7280', border:'rgba(209,213,219,1)', sidebarBg:'rgba(249,250,251,0.99)',btnBg:'linear-gradient(135deg,#3b82f6,#1d4ed8)', animated:false },
  ocean:      { name:'Ocean',       emoji:'🌊', bg:'#082f49',  containerBg:'rgba(8,47,73,0.96)',   cardBg:'rgba(12,74,110,0.85)', accent:'#06b6d4', accent2:'#0891b2', text:'#e0f2fe', subtext:'#7dd3fc', border:'rgba(14,116,144,0.6)',sidebarBg:'rgba(2,6,23,0.98)',      btnBg:'linear-gradient(135deg,#06b6d4,#0369a1)', animated:false },
  sunset:     { name:'Sunset',      emoji:'🌅', bg:'#431407',  containerBg:'rgba(67,20,7,0.96)',   cardBg:'rgba(124,45,18,0.85)',accent:'#fb923c',  accent2:'#f43f5e', text:'#fff7ed', subtext:'#fed7aa', border:'rgba(194,65,12,0.6)', sidebarBg:'rgba(28,10,0,0.98)',    btnBg:'linear-gradient(135deg,#fb923c,#dc2626)',  animated:false },
  forest:     { name:'Forest',      emoji:'🌲', bg:'#052e16',  containerBg:'rgba(5,46,22,0.96)',   cardBg:'rgba(20,83,45,0.85)', accent:'#4ade80',  accent2:'#22c55e', text:'#f0fdf4', subtext:'#86efac', border:'rgba(22,163,74,0.5)', sidebarBg:'rgba(0,10,4,0.98)',     btnBg:'linear-gradient(135deg,#4ade80,#15803d)',  animated:false },
  hero_red:   { name:'Hero Red',    emoji:'🦸', bg:'#1a0000',  containerBg:'rgba(40,0,0,0.96)',    cardBg:'rgba(60,0,0,0.9)',    accent:'#ef4444',  accent2:'#fbbf24', text:'#fef2f2', subtext:'#fca5a5', border:'rgba(239,68,68,0.4)', sidebarBg:'rgba(10,0,0,0.98)',     btnBg:'linear-gradient(135deg,#ef4444,#b91c1c)',  animated:true },
  dark_knight:{ name:'Dark Knight', emoji:'🦇', bg:'#000000',  containerBg:'rgba(10,10,20,0.97)',  cardBg:'rgba(15,15,30,0.95)', accent:'#a78bfa',  accent2:'#7c3aed', text:'#e9d5ff', subtext:'#c4b5fd', border:'rgba(167,139,250,0.3)',sidebarBg:'rgba(5,5,10,0.99)',     btnBg:'linear-gradient(135deg,#7c3aed,#4c1d95)',  animated:true },
  web_slinger:{ name:'Web Slinger', emoji:'🕷️', bg:'#1e0000',  containerBg:'rgba(30,0,10,0.96)',   cardBg:'rgba(50,0,15,0.9)',   accent:'#f87171',  accent2:'#3b82f6', text:'#fff1f2', subtext:'#fecaca', border:'rgba(248,113,113,0.4)',sidebarBg:'rgba(15,0,5,0.99)',    btnBg:'linear-gradient(135deg,#ef4444,#1d4ed8)',  animated:true },
  kpop_pink:  { name:'K-Pop Pink',  emoji:'🌸', bg:'#1a0014',  containerBg:'rgba(40,0,30,0.96)',   cardBg:'rgba(60,0,45,0.9)',   accent:'#f472b6',  accent2:'#e879f9', text:'#fdf2f8', subtext:'#f9a8d4', border:'rgba(244,114,182,0.4)',sidebarBg:'rgba(10,0,8,0.98)',    btnBg:'linear-gradient(135deg,#f472b6,#a21caf)',  animated:true },
  neon_city:  { name:'Neon City',   emoji:'🌆', bg:'#000814',  containerBg:'rgba(0,8,20,0.97)',    cardBg:'rgba(0,15,35,0.95)',  accent:'#00ff88',  accent2:'#ff0080', text:'#ccffee', subtext:'#99ffcc', border:'rgba(0,255,136,0.3)', sidebarBg:'rgba(0,4,10,0.99)',     btnBg:'linear-gradient(135deg,#00ff88,#00ccff)',  animated:true },
  galaxy:     { name:'Galaxy',      emoji:'🌌', bg:'#0a0015',  containerBg:'rgba(15,0,30,0.97)',   cardBg:'rgba(20,0,40,0.95)',  accent:'#c084fc',  accent2:'#818cf8', text:'#f5f3ff', subtext:'#d8b4fe', border:'rgba(192,132,252,0.3)',sidebarBg:'rgba(5,0,12,0.99)',    btnBg:'linear-gradient(135deg,#c084fc,#6d28d9)',  animated:true },
  golden:     { name:'Golden',      emoji:'✨', bg:'#1a1000',  containerBg:'rgba(40,25,0,0.97)',   cardBg:'rgba(50,30,0,0.95)',  accent:'#fbbf24',  accent2:'#f59e0b', text:'#fffbeb', subtext:'#fde68a', border:'rgba(251,191,36,0.4)', sidebarBg:'rgba(10,6,0,0.99)',    btnBg:'linear-gradient(135deg,#fbbf24,#d97706)',  animated:true },
};

const LANGUAGES=['English','Hindi','Bengali','Spanish','French','Arabic','Portuguese','Russian','Japanese','Korean','German','Chinese','Italian','Turkish','Vietnamese','Thai','Dutch','Polish','Swedish','Norwegian'];
const FONT_SIZES=['Small','Medium','Large','Extra Large'];
const FONT_SIZE_MAP={ Small:'13px', Medium:'15px', Large:'17px', 'Extra Large':'19px' };
const FONT_STYLES=[
  { name:'Default', value:'system-ui, sans-serif' },
  { name:'Modern', value:'"Inter", sans-serif' },
  { name:'Classic', value:'Georgia, serif' },
  { name:'Mono', value:'"Courier New", monospace' },
  { name:'Rounded', value:'"Trebuchet MS", sans-serif' },
  { name:'Elegant', value:'Palatino, serif' },
  { name:'Bold', value:'Impact, sans-serif' },
  { name:'Soft', value:'Verdana, sans-serif' },
  { name:'Futuristic', value:'"Arial Black", sans-serif' },
  { name:'Minimal', value:'"Helvetica Neue", sans-serif' },
];
const MALE_AVATARS=['👨','👨‍💻','👨‍🎓','👨‍🔬','👨‍🎨','👦','🧔','👨‍💼'];
const FEMALE_AVATARS=['👩','👩‍💻','👩‍🎓','👩‍🔬','👩‍🎨','👧','👩‍💼','🧕'];
const OTHER_AVATARS=['🧑','🧑‍💻','🧑‍🎓','🧑‍🔬','🧑‍🎨','🧑‍💼','🤖','👾'];
const INITIAL_CHAT=[{id:1,from:'bot',text:'Hi! I am your GitHub Growth Assistant. Ask me anything about improving your GitHub profile.'}];

function getAvatarsByGender(g){ if(g==='Male')return MALE_AVATARS; if(g==='Female')return FEMALE_AVATARS; return OTHER_AVATARS; }

// ── Helpers ────────────────────────────────────────────────────────────────
function AnimatedGitHubLogo({size=32,color='#38bdf8'}){
  return(<svg viewBox="0 0 16 16" style={{width:size,height:size,fill:color,animation:'floatLogo 3s ease-in-out infinite',display:'block'}} aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>);
}
function LoadingSpinner(){return <div className="spinner-wrapper"><div className="spinner"/><span className="spinner-label">Analyzing profile...</span></div>;}
function Toast({message,onClose}){useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[onClose]);return <div style={{position:'fixed',bottom:'5rem',left:'50%',transform:'translateX(-50%)',background:'rgba(20,20,20,0.97)',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'999px',fontSize:'0.9rem',zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.5)',border:'1px solid rgba(255,255,255,0.1)',whiteSpace:'nowrap'}}>{message}</div>;}
function UserAvatar({name,photo,avatarEmoji,size=36,accent='#38bdf8',onClick}){return(<div onClick={onClick} style={{width:size,height:size,borderRadius:'999px',overflow:'hidden',cursor:onClick?'pointer':'default',border:`2px solid ${accent}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg,${accent}44,${accent}22)`,fontSize:size*0.4,fontWeight:700,color:accent,userSelect:'none',transition:'transform 0.15s ease',boxShadow:`0 0 12px ${accent}44`}}>{photo?<img src={photo} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(avatarEmoji||(name?name[0].toUpperCase():'G'))}</div>);}

// ── Pie Chart Component ────────────────────────────────────────────────────
function PieChart({ data, size=180, t }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const COLORS = ['#38bdf8','#a78bfa','#4ade80','#fb923c','#f472b6','#fbbf24','#60a5fa','#34d399'];

  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const r = size / 2 - 10;
    const cx = size / 2, cy = size / 2;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { path, color: COLORS[i % COLORS.length], label: d.label, pct: Math.round(pct * 100) };
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
      <svg width={size} height={size} style={{ filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke={t.bg} strokeWidth="2" style={{ transition:'opacity 0.2s' }}/>
        ))}
        <circle cx={size/2} cy={size/2} r={size/4} fill={t.cardBg}/>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', width:'100%' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.78rem' }}>
            <div style={{ width:'0.7rem', height:'0.7rem', borderRadius:'2px', background:s.color, flexShrink:0 }}/>
            <span style={{ color:t.text, flex:1 }}>{s.label}</span>
            <span style={{ color:t.subtext, fontWeight:600 }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile Roast + Reality Check ─────────────────────────────────────────
function ProfileRealityCheck({ profile, languages, repos, streak, aiAnalysis, t }) {
  const p = profile || {};
  const issues = [];
  const badges = [];
  let placementScore = 0;
  let jobScore = 0;

  // Check bio
  if (!p.bio) issues.push({ icon:'💀', severity:'critical', title:'No Bio!', desc:'Your profile bio is completely empty. Recruiters skip profiles with no bio. You are invisible to 90% of hiring managers.', fix:'Go to GitHub → Edit profile → Add a bio describing what you do and what you are passionate about.' });
  else { placementScore += 10; jobScore += 10; }

  // Check avatar
  if (!p.avatar_url || p.avatar_url.includes('gravatar')) issues.push({ icon:'🙈', severity:'high', title:'No Profile Picture', desc:'You are using the default avatar. This screams "I do not care about my profile" to recruiters.', fix:'Upload a real professional photo. Even a clear selfie is 10x better than the default.' });
  else { placementScore += 8; jobScore += 8; }

  // Check repos
  if (repos.length === 0) issues.push({ icon:'🏜️', severity:'critical', title:'Zero Public Repositories!', desc:'Your GitHub is a ghost town. No repos means no proof you can code. This is a deal breaker for any job.', fix:'Push at least 3-5 projects publicly. They do not have to be perfect — just real.' });
  else if (repos.length < 3) issues.push({ icon:'📦', severity:'high', title:`Only ${repos.length} Public Repo(s)`, desc:'With less than 3 repos, your profile looks abandoned. Recruiters want to see consistent work.', fix:'Aim for at least 6-10 public repos showing different skills and project types.' });
  else { placementScore += 20; jobScore += 15; }

  // Check repo descriptions
  const noDesc = repos.filter(r => !r.description || r.description.length < 5).length;
  if (noDesc > 0) issues.push({ icon:'📝', severity:'medium', title:`${noDesc} Repos Have No Description`, desc:'Repos without descriptions look abandoned and unprofessional. Nobody knows what your code does.', fix:'Click the gear icon on each repo and add a clear 1-line description of what it does.' });
  else { placementScore += 10; jobScore += 10; }

  // Check streak
  const currentStreak = streak?.current_streak_days || 0;
  const yearlyContribs = streak?.yearly_contributions || 0;
  if (currentStreak === 0 && yearlyContribs < 10) issues.push({ icon:'💤', severity:'critical', title:'You Are Not Coding Regularly!', desc:`Only ${yearlyContribs} contributions this year. Your activity graph is basically flat. This is a massive red flag for recruiters.`, fix:'Commit code every single day — even documentation updates count. Build the habit.' });
  else if (yearlyContribs < 50) issues.push({ icon:'📉', severity:'high', title:'Low Contribution Activity', desc:`${yearlyContribs} contributions this year is below average. Consistent activity shows dedication.`, fix:'Set a daily coding goal. Even 30 minutes of coding and committing daily will transform your graph in 3 months.' });
  else { placementScore += 20; jobScore += 20; }

  // Check languages
  if (languages.length === 0) issues.push({ icon:'🤔', severity:'high', title:'No Programming Languages Detected', desc:'GitHub cannot detect any languages from your repos. This usually means your repos are empty or just contain text files.', fix:'Push actual code files (.py, .js, .java etc) to your repositories.' });
  else if (languages.length === 1) issues.push({ icon:'🔧', severity:'medium', title:'Only One Language Used', desc:`You only show ${languages[0]?.language} skills. Tech companies want to see versatility.`, fix:'Build one project in a different language or framework to show you can learn new technologies.' });
  else { placementScore += 15; jobScore += 15; }

  // Check followers
  if ((p.followers || 0) < 5) issues.push({ icon:'👻', severity:'low', title:'Almost No Followers', desc:'Low followers suggest you are not engaging with the developer community at all.', fix:'Star repositories you use, follow developers in your field, and contribute to open source.' });
  else { placementScore += 7; jobScore += 7; }

  // Check profile README
  const hasReadme = repos.some(r => r.name?.toLowerCase() === p.username?.toLowerCase());
  if (!hasReadme) issues.push({ icon:'📄', severity:'high', title:'No Profile README', desc:'A profile README is the #1 thing that makes senior developers and recruiters stop and look at your profile.', fix:`Create a repository named exactly "${p.username}" and add a README.md to it. This appears on your profile page.` });
  else { placementScore += 10; jobScore += 15; }

  // Placement score
  placementScore = Math.min(100, placementScore);
  jobScore = Math.min(100, jobScore);

  // GitHub Badges guide
  const badgesGuide = [
    { name:'Arctic Code Vault Contributor', how:'Contribute to any public repo before February 2020 Arctic snapshot', difficulty:'Easy — historical' },
    { name:'Pull Shark', how:'Open Pull Requests that get merged. Bronze = 2 merged PRs, Silver = 16, Gold = 128', difficulty:'Medium' },
    { name:'YOLO', how:'Merge your own PR without a review', difficulty:'Easy — do it on your own repo' },
    { name:'Quickdraw', how:'Close an issue or PR within 5 minutes of opening it', difficulty:'Very Easy' },
    { name:'Starstruck', how:'Have a repository with 16 stars. Silver = 128 stars, Gold = 512 stars', difficulty:'Hard — needs popular project' },
    { name:'Pair Extraordinaire', how:'Co-author commits in merged PRs using git commit co-author feature', difficulty:'Medium' },
    { name:'Galaxy Brain', how:'Answer a Discussion that gets marked as the accepted answer', difficulty:'Medium' },
    { name:'Public Sponsor', how:'Sponsor an open source contributor through GitHub Sponsors', difficulty:'Easy — requires payment' },
  ];

  // Pie chart data
  const pieData = [
    { label:'Repositories', value: Math.min(repos.length * 10, 30) },
    { label:'Activity', value: Math.min(yearlyContribs / 3, 25) },
    { label:'Languages', value: Math.min(languages.length * 8, 20) },
    { label:'Profile Info', value: (p.bio?5:0)+(p.avatar_url&&!p.avatar_url.includes('gravatar')?5:0)+(p.location?3:0)+(p.blog?3:0)+(hasReadme?9:0) },
    { label:'Community', value: Math.min((p.followers||0)*2, 15) },
  ].filter(d => d.value > 0);

  const severityOrder = { critical:0, high:1, medium:2, low:3 };
  const sortedIssues = [...issues].sort((a,b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const severityColor = { critical:'#ef4444', high:'#fb923c', medium:'#fbbf24', low:'#60a5fa' };
  const severityBg = { critical:'rgba(239,68,68,0.12)', high:'rgba(251,146,60,0.12)', medium:'rgba(251,191,36,0.12)', low:'rgba(96,165,250,0.12)' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', marginTop:'1.5rem' }}>

      {/* Header */}
      <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'1rem', padding:'1.25rem' }}>
        <h2 style={{ margin:'0 0 0.25rem', color:t.text, fontSize:'1.2rem', fontWeight:800 }}>📊 Profile Reality Check</h2>
        <p style={{ margin:0, color:t.subtext, fontSize:'0.88rem' }}>Here is the brutal honest truth about your GitHub profile @{p.username}</p>
      </div>

      {/* Two column layout: left = issues, right = chart + scores */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.25rem', alignItems:'start' }}>

        {/* LEFT: Issues */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {sortedIssues.length === 0 ? (
            <div style={{ background:t.cardBg, border:`1px solid ${t.accent}`, borderRadius:'1rem', padding:'1.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🎉</div>
              <div style={{ color:t.accent, fontWeight:700 }}>Excellent! No major issues found!</div>
              <div style={{ color:t.subtext, fontSize:'0.85rem', marginTop:'0.25rem' }}>Your profile is in great shape. Keep it up!</div>
            </div>
          ) : sortedIssues.map((issue, i) => (
            <div key={i} style={{ background:severityBg[issue.severity], border:`1px solid ${severityColor[issue.severity]}44`, borderRadius:'1rem', padding:'1rem', borderLeft:`4px solid ${severityColor[issue.severity]}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                <span style={{ fontSize:'1.2rem' }}>{issue.icon}</span>
                <span style={{ color:severityColor[issue.severity], fontWeight:700, fontSize:'0.9rem' }}>{issue.title}</span>
                <span style={{ marginLeft:'auto', padding:'0.1rem 0.5rem', borderRadius:'999px', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', background:`${severityColor[issue.severity]}22`, color:severityColor[issue.severity], border:`1px solid ${severityColor[issue.severity]}44` }}>{issue.severity}</span>
              </div>
              <p style={{ margin:'0 0 0.5rem', color:t.text, fontSize:'0.85rem', lineHeight:1.6 }}>{issue.desc}</p>
              <div style={{ background:`rgba(255,255,255,0.05)`, borderRadius:'0.5rem', padding:'0.5rem 0.75rem' }}>
                <span style={{ color:t.accent, fontSize:'0.8rem', fontWeight:600 }}>✅ Fix: </span>
                <span style={{ color:t.subtext, fontSize:'0.8rem' }}>{issue.fix}</span>
              </div>
            </div>
          ))}

          {/* Badges Guide */}
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'1rem', padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 1rem', color:t.accent, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>🏅 How to Earn GitHub Badges</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {badgesGuide.map((badge, i) => (
                <div key={i} style={{ padding:'0.75rem', background:`rgba(255,255,255,0.03)`, borderRadius:'0.75rem', border:`1px solid ${t.border}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
                    <span style={{ color:t.text, fontWeight:600, fontSize:'0.85rem' }}>{badge.name}</span>
                    <span style={{ padding:'0.1rem 0.5rem', borderRadius:'999px', fontSize:'0.68rem', background:`${t.accent}22`, color:t.accent, border:`1px solid ${t.accent}44` }}>{badge.difficulty}</span>
                  </div>
                  <p style={{ margin:0, color:t.subtext, fontSize:'0.8rem' }}>{badge.how}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Pie chart + Career scores */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:'5rem' }}>

          {/* Pie Chart */}
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'1rem', padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 1rem', color:t.accent, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>Profile Breakdown</h3>
            <PieChart data={pieData} size={160} t={t} />
          </div>

          {/* Placement Score */}
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'1rem', padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 1rem', color:t.accent, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>Career Readiness</h3>
            {[
              { label:'Placement Ready', score:placementScore, color: placementScore>=70?'#4ade80':placementScore>=40?'#fbbf24':'#ef4444' },
              { label:'Job Market Ready', score:jobScore, color: jobScore>=70?'#4ade80':jobScore>=40?'#fbbf24':'#ef4444' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom:'0.85rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', marginBottom:'0.3rem' }}>
                  <span style={{ color:t.text, fontWeight:600 }}>{item.label}</span>
                  <span style={{ color:item.color, fontWeight:700 }}>{item.score}%</span>
                </div>
                <div style={{ height:'0.5rem', borderRadius:'999px', background:t.border }}>
                  <div style={{ height:'100%', borderRadius:'999px', background:item.color, width:`${item.score}%`, transition:'width 1s ease' }}/>
                </div>
                <div style={{ color:t.subtext, fontSize:'0.72rem', marginTop:'0.2rem' }}>
                  {item.score>=70?'✅ Ready for opportunities!':item.score>=40?'⚡ Almost there, keep improving':'❌ Needs significant improvement'}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'1rem', padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 0.75rem', color:t.accent, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>Quick Stats</h3>
            {[
              { label:'Public Repos', value:repos.length, good: repos.length>=5 },
              { label:'Followers', value:p.followers||0, good:(p.followers||0)>=10 },
              { label:'Contributions', value:yearlyContribs+' this yr', good:yearlyContribs>=50 },
              { label:'Languages', value:languages.length, good:languages.length>=2 },
              { label:'Current Streak', value:currentStreak+' days', good:currentStreak>=3 },
            ].map(stat => (
              <div key={stat.label} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:`1px solid ${t.border}` }}>
                <span style={{ color:t.subtext, fontSize:'0.8rem' }}>{stat.label}</span>
                <span style={{ color:stat.good?'#4ade80':'#f87171', fontSize:'0.8rem', fontWeight:600 }}>{stat.value} {stat.good?'✓':'✗'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Auth Page ──────────────────────────────────────────────────────────────
function AuthPage({onLogin,theme}){
  const t=THEMES[theme];
  const [tab,setTab]=useState('login');
  const [fullName,setFullName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [authError,setAuthError]=useState('');
  const [toast,setToast]=useState('');
  const handleSubmit=()=>{
    setAuthError('');
    if(tab==='signup'){
      if(!fullName.trim()){setAuthError('Please enter your full name.');return;}
      if(!email.trim()){setAuthError('Please enter your email.');return;}
      if(password.length<6){setAuthError('Password must be at least 6 characters.');return;}
      if(password!==confirmPassword){setAuthError('Passwords do not match.');return;}
      const ex=localStorage.getItem('gpa-email');
      if(ex&&ex===email.trim()){setAuthError('Account already exists. Please sign in.');setTab('login');return;}
      localStorage.setItem('gpa-username',fullName.trim());localStorage.setItem('gpa-email',email.trim());localStorage.setItem('gpa-password',password);
      onLogin(fullName.trim(),email.trim(),true);
    } else {
      if(!email.trim()||!password.trim()){setAuthError('Please fill in all fields.');return;}
      const se=localStorage.getItem('gpa-email'),sp=localStorage.getItem('gpa-password');
      if(!se){setAuthError('No account found. Please create an account first.');return;}
      if(se!==email.trim()){setAuthError('No account found with this email.');return;}
      if(sp!==password){setAuthError('Incorrect password.');return;}
      const sn=localStorage.getItem('gpa-username')||email.split('@')[0];
      onLogin(sn,email.trim(),false);
    }
  };
  const inp={background:t.cardBg,color:t.text,borderColor:t.border};
  return(
    <div className="auth-overlay" style={{background:`radial-gradient(circle at 30% 20%,${t.accent}22,transparent 60%),radial-gradient(circle at 70% 80%,${t.accent2}22,transparent 60%),${t.bg}`}}>
      {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
      <div className="auth-floating-logo"><AnimatedGitHubLogo size={52} color={t.accent}/><h2 style={{color:t.text,margin:'0.75rem 0 0',fontSize:'1.4rem',fontWeight:700,letterSpacing:'-0.02em'}}>GitHub Profile Analyzer</h2><p style={{color:t.subtext,margin:'0.25rem 0 0',fontSize:'0.9rem'}}>AI-powered GitHub insights</p></div>
      <div className="auth-card" style={{background:t.containerBg,border:`1px solid ${t.border}`}}>
        <div className="auth-tabs" style={{borderBottom:`1px solid ${t.border}`}}>{[['login','Sign In'],['signup','Create Account']].map(([k,label])=>(<button key={k} className="auth-tab" onClick={()=>{setTab(k);setAuthError('');}} style={{color:tab===k?t.accent:t.subtext,borderBottom:tab===k?`2px solid ${t.accent}`:'2px solid transparent',fontWeight:tab===k?700:400}}>{label}</button>))}</div>
        <div className="auth-social">
          <button className="social-btn" onClick={()=>setToast('Google login coming soon! 🚀')} style={{border:`1px solid ${t.border}`,color:t.text,background:t.cardBg}}>
            <svg viewBox="0 0 24 24" width="18" height="18" style={{marginRight:'0.5rem',flexShrink:0}}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <button className="social-btn" onClick={()=>setToast('GitHub login coming soon! 🚀')} style={{border:`1px solid ${t.border}`,color:t.text,background:t.cardBg}}><AnimatedGitHubLogo size={18} color={t.text}/><span style={{marginLeft:'0.5rem'}}>Continue with GitHub</span></button>
        </div>
        <div className="auth-divider" style={{color:t.subtext}}><span style={{background:t.containerBg,padding:'0 0.75rem',position:'relative',zIndex:1}}>or continue with email</span></div>
        {authError&&<p className="auth-error">{authError}</p>}
        <div className="auth-fields">
          {tab==='signup'&&<input className="auth-input" type="text" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp}/>}
          <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={inp} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          <div style={{position:'relative'}}><input className="auth-input" type={showPassword?'text':'password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{...inp,paddingRight:'3rem',width:'100%',boxSizing:'border-box'}} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/><button onClick={()=>setShowPassword(p=>!p)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:t.subtext,fontSize:'1rem',padding:0}}>{showPassword?'🙈':'👁️'}</button></div>
          {tab==='signup'&&(<div style={{position:'relative'}}><input className="auth-input" type={showConfirm?'text':'password'} placeholder="Re-enter password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{...inp,paddingRight:'3rem',width:'100%',boxSizing:'border-box',borderColor:confirmPassword&&confirmPassword!==password?'#f87171':t.border}} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/><button onClick={()=>setShowConfirm(p=>!p)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:t.subtext,fontSize:'1rem',padding:0}}>{showConfirm?'🙈':'👁️'}</button>{confirmPassword&&confirmPassword!==password&&<p style={{color:'#f87171',fontSize:'0.78rem',margin:'0.25rem 0 0 0.25rem'}}>Passwords do not match</p>}</div>)}
        </div>
        <button className="auth-submit-btn" onClick={handleSubmit} style={{background:t.btnBg}}>{tab==='login'?'Sign In':'Create Account'}</button>
        <button className="auth-guest-btn" onClick={()=>onLogin('Guest','',false)} style={{color:t.subtext,borderColor:t.border}}>Continue as Guest</button>
        {tab==='login'&&(<p style={{textAlign:'center',fontSize:'0.85rem',color:t.subtext,margin:0}}>Don't have an account?{' '}<button onClick={()=>{setTab('signup');setAuthError('');}} style={{background:'none',border:'none',color:t.accent,cursor:'pointer',fontWeight:600,fontSize:'0.85rem',padding:0}}>Sign up</button></p>)}
        {tab==='signup'&&(<p style={{textAlign:'center',fontSize:'0.85rem',color:t.subtext,margin:0}}>Already have an account?{' '}<button onClick={()=>{setTab('login');setAuthError('');}} style={{background:'none',border:'none',color:t.accent,cursor:'pointer',fontWeight:600,fontSize:'0.85rem',padding:0}}>Sign in</button></p>)}
      </div>
    </div>
  );
}

// ── Onboarding ─────────────────────────────────────────────────────────────
const ROLES=['Student','Professor','Teacher','Developer','Learner'];
const LEVELS=['Beginner','Intermediate','Skilled'];
const GENDERS=['Male','Female','Others'];
function OnboardingSlides({userName,onComplete,theme}){
  const t=THEMES[theme];
  const [step,setStep]=useState(0);
  const [role,setRole]=useState('');
  const [level,setLevel]=useState('');
  const [gender,setGender]=useState('');
  const slides=[
    {title:`Welcome, ${userName}!`,subtitle:"Let's personalize your experience.",question:'What best describes you?',content:<div className="onboard-options">{ROLES.map(r=><button key={r} className="onboard-option" onClick={()=>setRole(r)} style={{border:`1px solid ${role===r?t.accent:t.border}`,color:role===r?t.accent:t.text,background:role===r?`${t.accent}18`:t.cardBg,fontWeight:role===r?600:400}}>{r}</button>)}</div>,canNext:!!role},
    {title:'Your Gender',subtitle:'Help us personalize your avatar.',question:'How do you identify?',content:<div className="onboard-options">{GENDERS.map(g=><button key={g} className="onboard-option" onClick={()=>setGender(g)} style={{border:`1px solid ${gender===g?t.accent:t.border}`,color:gender===g?t.accent:t.text,background:gender===g?`${t.accent}18`:t.cardBg,fontWeight:gender===g?600:400}}>{g}</button>)}</div>,canNext:!!gender},
    {title:'Your Experience Level',subtitle:"We'll tailor tips to match your knowledge.",question:'How experienced are you with GitHub?',content:<div className="onboard-options">{LEVELS.map(l=><button key={l} className="onboard-option" onClick={()=>setLevel(l)} style={{border:`1px solid ${level===l?t.accent:t.border}`,color:level===l?t.accent:t.text,background:level===l?`${t.accent}18`:t.cardBg,fontWeight:level===l?600:400}}>{l}</button>)}</div>,canNext:!!level},
    {title:"You're all set!",subtitle:`${role} · ${gender} · ${level}`,question:'',content:<div style={{textAlign:'center',padding:'1.5rem 0'}}><div style={{fontSize:'3.5rem',marginBottom:'1rem',animation:'floatLogo 2s ease-in-out infinite'}}>🚀</div><p style={{color:t.subtext,fontSize:'0.95rem',lineHeight:1.6}}>Start exploring GitHub profiles, get AI insights, and grow your developer presence.</p></div>,canNext:true},
  ];
  const current=slides[step];
  return(<div className="onboard-overlay" style={{background:`radial-gradient(circle at 30% 20%,${t.accent}22,transparent 60%),${t.bg}`}}><div className="onboard-card" style={{background:t.containerBg,border:`1px solid ${t.border}`}}><div className="onboard-progress">{slides.map((_,i)=><div key={i} className="onboard-dot" style={{background:i<=step?t.accent:t.border,width:i===step?'2rem':'0.5rem',transition:'all 0.3s ease'}}/>)}</div>{current.question&&<p className="onboard-question" style={{color:t.subtext}}>{current.question}</p>}<h2 className="onboard-title" style={{color:t.text}}>{current.title}</h2><p className="onboard-subtitle" style={{color:t.subtext}}>{current.subtitle}</p>{current.content}<div className="onboard-actions">{step>0&&<button className="onboard-back-btn" onClick={()=>setStep(s=>s-1)} style={{color:t.subtext,borderColor:t.border}}>Back</button>}<button className="onboard-next-btn" onClick={()=>step<slides.length-1?setStep(s=>s+1):onComplete({role,gender,level})} disabled={!current.canNext} style={{background:current.canNext?t.btnBg:t.border,cursor:current.canNext?'pointer':'not-allowed',opacity:current.canNext?1:0.6}}>{step===slides.length-1?'Get Started':'Next'}</button></div></div></div>);
}

// ── Cards ──────────────────────────────────────────────────────────────────
function ProfileCard({profile}){
  const has=profile&&profile.username;
  return(<div className="result-card profile-card"><div className="result-card-header"><h3>Profile</h3></div><div className="profile-card-body"><div className="profile-avatar" style={has&&profile.avatar_url?{backgroundImage:`url(${profile.avatar_url})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}/><div className="profile-meta"><div className="profile-name">{has?profile.name||profile.username:'GitHub User'}</div><div className="profile-username">{has?`@${profile.username}`:'@username'}</div><p className="profile-bio">{has?profile.bio||'No bio yet.':'Bio appears here.'}</p><div className="profile-stats"><span><strong>{has?profile.followers??0:0}</strong> Followers</span><span><strong>{has?profile.following??0:0}</strong> Following</span></div></div></div></div>);
}
function TopLanguagesCard({languages}){
  const has=languages&&languages.length>0;
  return(<div className="result-card languages-card"><div className="result-card-header"><h3>Top Languages</h3></div><div className="languages-placeholder"><div className="language-bar background"/><div className="language-bar foreground"/>{has?<p>{languages.map(l=><span key={l.language} style={{marginRight:'0.75rem'}}><strong>{l.language}</strong> {l.percentage}%</span>)}</p>:<p>Language distribution will appear here.</p>}</div></div>);
}
function RepositoryHighlightsCard({repos}){
  const display=(repos||[]).slice(0,3);
  const ph=[{name:'awesome-project',stars:123,description:'Repository highlights appear here.'},{name:'api-service',stars:98,description:'Another top repository.'},{name:'ui-library',stars:76,description:'A third highlight.'}];
  return(<div className="result-card repos-card"><div className="result-card-header"><h3>Repository Highlights</h3></div><ul className="repo-list">{(display.length>0?display:ph).map(repo=>(<li className="repo-item" key={repo.name}><div className="repo-main"><span className="repo-name">{repo.name}</span><span className="repo-stars">★ {repo.stars}</span></div><p className="repo-description">{repo.description||'No description.'}</p></li>))}</ul></div>);
}
function AiAnalysisCard({analysis,error}){
  return(<div className="result-card ai-card"><div className="result-card-header"><div className="ai-header"><div className="ai-icon"><div className="ai-eye left"/><div className="ai-eye right"/></div><h3>AI Analysis</h3></div></div>{error&&<p className="ai-text">{error}</p>}{!error&&analysis&&(<div className="ai-text"><p><strong>Overall score:</strong> {analysis.overall_score??'N/A'} / 10</p><p><strong>Strengths:</strong></p><ul>{(analysis.top_strengths||[]).map((item,i)=><li key={i}>{item}</li>)}</ul><p><strong>Improvements:</strong></p><ul>{(analysis.top_improvements||[]).map((item,i)=><li key={i}>{item}</li>)}</ul><p><strong>Career insights:</strong> {analysis.career_insights||'—'}</p><p><strong>Weekly tip:</strong> {analysis.weekly_tip||'—'}</p></div>)}{!error&&!analysis&&<p className="ai-text">AI summary appears here after analysis.</p>}</div>);
}
function ContributionStreakCard({streak}){
  const current=streak?.current_streak_days??0,longest=streak?.longest_streak_days??0,yearly=streak?.yearly_contributions??0;
  let message='Start your streak today!';
  if(current>=1&&current<=7)message='Great start! Keep going!';
  else if(current>=8&&current<30)message="You're on fire!";
  else if(current>=30)message='Unstoppable! Legend!';
  return(<div className="result-card streak-card"><div className="result-card-header"><h3>Contribution Streak</h3></div><div className="streak-main"><div className="streak-badge"><span className="streak-fire">🔥</span><span className="streak-number">{current}</span><span className="streak-label">day streak</span></div><div className="streak-submetrics"><div><span className="streak-sub-label">Longest</span><span className="streak-sub-value">{longest} days</span></div><div><span className="streak-sub-label">This year</span><span className="streak-sub-value">{yearly}</span></div></div></div><p className="streak-message">{message}</p></div>);
}

// ── Compare Section ────────────────────────────────────────────────────────
function CompareSection({theme, language, isPremium, compareCount, setCompareCount, setView}) {
  const tTheme = THEMES[theme];
  const [user1, setUser1] = useState(''); const [user2, setUser2] = useState(''); const [isLoading, setIsLoading] = useState(false); const [result, setResult] = useState(null); const [error, setError] = useState('');
  
  const handleCompare = async () => {
    if (!user1.trim() || !user2.trim()) { setError('Please enter both usernames.'); return; }
    if (!isPremium && compareCount >= 3) {
      setError('Free limit reached! You have used your 3 free comparisons.');
      setTimeout(() => setView('subscription'), 2000);
      return;
    }
    setIsLoading(true); setError(''); setResult(null);
    try {
      const resp = await axios.post(`http://127.0.0.1:8000/compare`, { username1: user1.trim(), username2: user2.trim() });
      setResult(resp.data);
      if (!isPremium) {
        const newCount = compareCount + 1;
        setCompareCount(newCount);
        localStorage.setItem('gpa-compare-count', newCount.toString());
      }
    } catch {
      setError('Failed to compare. Ensure both usernames exist and backend is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const CRow = ({label, v1, v2, numeric = false}) => {
    const n1 = numeric ? Number(v1) : 0, n2 = numeric ? Number(v2) : 0, v1w = numeric && n1 > n2, v2w = numeric && n2 > n1;
    return (
      <>
        <div style={{textAlign: 'center', padding: '0.6rem 0.25rem', borderBottom: `1px solid ${tTheme.border}`, color: v1w ? tTheme.accent : tTheme.text, fontWeight: v1w ? 700 : 400}}>{String(v1)}</div>
        <div style={{textAlign: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${tTheme.border}`, color: tTheme.subtext, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em'}}>{label}</div>
        <div style={{textAlign: 'center', padding: '0.6rem 0.25rem', borderBottom: `1px solid ${tTheme.border}`, color: v2w ? tTheme.accent : tTheme.text, fontWeight: v2w ? 700 : 400}}>{String(v2)}</div>
      </>
    );
  };

  return (
    <section style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      <div>
        <h2 style={{margin: 0, color: tTheme.text, fontSize: '1.3rem', fontWeight: 700}}>{tStr(language, 'compare')}</h2>
        <p style={{color: tTheme.subtext, fontSize: '0.9rem', margin: '0.25rem 0 0'}}>Deep compare two GitHub profiles {!isPremium && `(${3 - compareCount} free left)`}</p>
      </div>
      <div className="compare-inputs">
        <input className="auth-input" type="text" placeholder="Your username" value={user1} onChange={e => setUser1(e.target.value)} style={{background: tTheme.cardBg, color: tTheme.text, borderColor: tTheme.border}} onKeyDown={e => e.key === 'Enter' && handleCompare()}/>
        <span style={{color: tTheme.subtext, fontWeight: 700, padding: '0 0.25rem', flexShrink: 0}}>vs</span>
        <input className="auth-input" type="text" placeholder="Compare with" value={user2} onChange={e => setUser2(e.target.value)} style={{background: tTheme.cardBg, color: tTheme.text, borderColor: tTheme.border}} onKeyDown={e => e.key === 'Enter' && handleCompare()}/>
        <button className="search-button" onClick={handleCompare} disabled={isLoading} style={{background: tTheme.btnBg, whiteSpace: 'nowrap', flexShrink: 0}}>{isLoading ? 'Comparing...' : 'Compare'}</button>
      </div>
      {error && <p style={{color: '#f87171', fontSize: '0.9rem'}}>{error}</p>}
      
      {result && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{background: `${tTheme.accent}22`, border: `1px solid ${tTheme.accent}55`, borderRadius: '1rem', padding: '1.25rem', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🏆</div>
            <div style={{color: tTheme.accent, fontWeight: 700, fontSize: '1.2rem'}}>{result.comparison?.winner_reason || "Detailed comparison completed."}</div>
          </div>
          
          <div style={{background: tTheme.cardBg, border: `1px solid ${tTheme.border}`, borderRadius: '1rem', padding: '1.25rem'}}>
            <h3 style={{color: tTheme.accent, margin: '0 0 0.75rem', fontSize: '0.95rem'}}>AI Detailed Summary</h3>
            <p style={{color: tTheme.text, fontSize: '0.9rem', lineHeight: 1.6, margin: 0}}>{result.comparison?.detailed_comparison}</p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem'}}>
            <div style={{background: tTheme.cardBg, border: `1px solid ${tTheme.border}`, borderRadius: '1rem', padding: '1.25rem'}}>
              <h4 style={{color: tTheme.text, margin: '0 0 0.75rem', fontSize: '0.9rem'}}>Tips for @{result.profile1?.username}:</h4>
              <ul style={{margin: 0, paddingLeft: '1.2rem', color: tTheme.subtext, fontSize: '0.88rem'}}>
                {(result.comparison?.suggestions_user1 || []).map((tip, i) => <li key={i} style={{marginBottom: '0.3rem'}}>{tip}</li>)}
              </ul>
            </div>
            <div style={{background: tTheme.cardBg, border: `1px solid ${tTheme.border}`, borderRadius: '1rem', padding: '1.25rem'}}>
              <h4 style={{color: tTheme.text, margin: '0 0 0.75rem', fontSize: '0.9rem'}}>Tips for @{result.profile2?.username}:</h4>
              <ul style={{margin: 0, paddingLeft: '1.2rem', color: tTheme.subtext, fontSize: '0.88rem'}}>
                {(result.comparison?.suggestions_user2 || []).map((tip, i) => <li key={i} style={{marginBottom: '0.3rem'}}>{tip}</li>)}
              </ul>
            </div>
          </div>

          <div style={{border: `1px solid ${tTheme.border}`, background: tTheme.cardBg, borderRadius: '1rem', padding: '1.25rem'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.25rem'}}>
              <div style={{textAlign: 'center', fontWeight: 700, color: tTheme.accent, padding: '0.5rem 0', borderBottom: `2px solid ${tTheme.accent}`}}>@{result.profile1?.username}</div>
              <div style={{textAlign: 'center', color: tTheme.subtext, padding: '0.5rem 0', borderBottom: `2px solid ${tTheme.border}`}}></div>
              <div style={{textAlign: 'center', fontWeight: 700, color: tTheme.accent, padding: '0.5rem 0', borderBottom: `2px solid ${tTheme.accent}`}}>@{result.profile2?.username}</div>
              
              <CRow label="Followers" v1={result.profile1?.analysis?.profile?.followers ?? 0} v2={result.profile2?.analysis?.profile?.followers ?? 0} numeric/>
              <CRow label="AI Score" v1={result.profile1?.analysis?.ai_analysis?.overall_score ?? 0} v2={result.profile2?.analysis?.ai_analysis?.overall_score ?? 0} numeric/>
              <CRow label="Streak Days" v1={result.profile1?.analysis?.contribution_streak?.current_streak_days ?? 0} v2={result.profile2?.analysis?.contribution_streak?.current_streak_days ?? 0} numeric/>
              <CRow label="Yearly Commits" v1={result.profile1?.analysis?.contribution_streak?.yearly_contributions ?? 0} v2={result.profile2?.analysis?.contribution_streak?.yearly_contributions ?? 0} numeric/>
              <CRow label="Public Repos" v1={result.profile1?.analysis?.top_repositories?.length ?? 0} v2={result.profile2?.analysis?.top_repositories?.length ?? 0} numeric/>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Tutorial ───────────────────────────────────────────────────────────────
const tutorialTips=[{id:'b1',level:'Beginner',title:'What is GitHub and why use it',text:'GitHub is a platform for hosting and collaborating on code using Git. It lets you store your projects, track changes over time, and work with others through pull requests and issues.'},{id:'b2',level:'Beginner',title:'Create your first repository',text:'Start by creating a new repository with a clear name and description. Initialize it with a README so visitors immediately understand what the project does.'},{id:'b3',level:'Beginner',title:'Commits, push and pull',text:'Commits capture snapshots of your code; push uploads local commits to GitHub, while pull fetches the latest changes from the remote repository to your machine.'},{id:'b4',level:'Beginner',title:'Write a good README',text:'A strong README explains what the project is, how to install it, how to use it, and any contribution guidelines.'},{id:'b5',level:'Beginner',title:'Branches and why they matter',text:'Branches let you experiment and build features without breaking main. Create feature branches, make changes there, then merge them back once reviewed.'},{id:'i1',level:'Intermediate',title:'Contribute to open source',text:'Find beginner-friendly issues, fork the repository, create a branch, make focused changes, and open a pull request explaining what you improved and why.'},{id:'i2',level:'Intermediate',title:'Understanding Pull Requests',text:'A pull request proposes changes from one branch to another. Use clear titles, detailed descriptions, and small reviewable changes.'},{id:'i3',level:'Intermediate',title:'Use GitHub Issues effectively',text:'Create issues to track bugs, ideas, and tasks with labels, milestones, and checklists.'},{id:'i4',level:'Intermediate',title:'GitHub Actions basics',text:'Use GitHub Actions to run tests or deployments automatically on every push or pull request, keeping your codebase healthy.'},{id:'p1',level:'Pro',title:'Getting your first 100 followers',text:'Share useful projects, write about your work, and engage in issues and discussions. Consistent visible contributions attract followers over time.'},{id:'p2',level:'Pro',title:'Pin your best repositories',text:'Use the pinned repositories feature to highlight 3-6 projects that best represent your skills.'},{id:'p3',level:'Pro',title:'Write an impressive profile README',text:'A profile README can showcase who you are, what you build, and where to find more about you.'},{id:'p4',level:'Pro',title:'How recruiters view GitHub',text:'Recruiters look for clean code, meaningful projects, clear documentation, and consistent activity.'}];
const VIDEO_TUTORIALS=[{id:'RGOj5yH7evk',title:'GitHub for Beginners — Full Course',level:'Beginner'},{id:'iv8rSLsi1xo',title:'How to Use GitHub',level:'Beginner'},{id:'HbSjyU2vf6Y',title:'Git and GitHub Crash Course',level:'Beginner'},{id:'jhtbhSpFBTg',title:'How to Contribute to Open Source',level:'Intermediate'},{id:'i_23KUAEtUM',title:'GitHub Actions Full Course',level:'Intermediate'},{id:'apGV9Kg7ics',title:'GitHub Pull Requests Tutorial',level:'Intermediate'}];
function TutorialSection({theme}){const t=THEMES[theme];const [learnedIds,setLearnedIds]=useState([]);const [query,setQuery]=useState('');const [activeTab,setActiveTab]=useState('written');const filtered=tutorialTips.filter(tip=>{if(!query.trim())return true;const q=query.toLowerCase();return tip.title.toLowerCase().includes(q)||tip.text.toLowerCase().includes(q)||tip.level.toLowerCase().includes(q);});const total=filtered.length,completed=filtered.filter(tip=>learnedIds.includes(tip.id)).length;const progress=total>0?Math.round((completed/total)*100):0;const toggleLearned=id=>setLearnedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);const sections=[{label:'Beginner',level:'Beginner'},{label:'Intermediate',level:'Intermediate'},{label:'Pro',level:'Pro'}];return(<section className="tutorial-section"><div className="tutorial-header"><div><h2 className="tutorial-title" style={{color:t.text}}>Learn GitHub</h2><p className="tutorial-subtitle" style={{color:t.subtext}}>From first commit to a standout presence.</p></div><div className="tutorial-progress"><div className="tutorial-progress-label" style={{color:t.subtext}}>Progress: {completed}/{total}</div><div className="tutorial-progress-bar" style={{background:t.border}}><div className="tutorial-progress-fill" style={{width:`${progress}%`,background:t.accent}}/></div></div></div><div style={{borderBottom:`1px solid ${t.border}`,marginBottom:'1.25rem',display:'flex'}}>{[{key:'written',label:'Written Tips'},{key:'videos',label:'Video Tutorials'}].map(({key,label})=>(<button key={key} onClick={()=>setActiveTab(key)} style={{padding:'0.6rem 1.25rem',background:'none',border:'none',cursor:'pointer',fontWeight:activeTab===key?700:400,fontSize:'0.9rem',color:activeTab===key?t.accent:t.subtext,borderBottom:activeTab===key?`2px solid ${t.accent}`:'2px solid transparent'}}>{label}</button>))}</div>{activeTab==='written'&&(<><div className="tutorial-search-row"><input type="text" className="tutorial-search-input" placeholder="Search tips..." value={query} onChange={e=>setQuery(e.target.value)} style={{background:t.cardBg,color:t.text,borderColor:t.border}}/></div>{sections.map(section=>{const items=filtered.filter(tip=>tip.level===section.level);if(items.length===0)return null;return(<div key={section.level} className="tutorial-section-block"><h3 className="tutorial-section-heading" style={{color:t.accent}}>{section.label}</h3><div className="tutorial-grid">{items.map(tip=>{const learned=learnedIds.includes(tip.id);return(<article key={tip.id} className={`tutorial-card ${learned?'tutorial-card-learned':''}`} style={{background:t.cardBg,border:`1px solid ${learned?t.accent:t.border}`}}><div className="tutorial-header-text"><h4 className="tutorial-card-title" style={{color:t.text}}>{tip.title}</h4><span className={`difficulty-badge difficulty-${tip.level.toLowerCase()}`}>{tip.level}</span></div><p className="tutorial-card-body" style={{color:t.subtext}}>{tip.text}</p><label className="tutorial-checkbox-row" style={{color:t.subtext}}><input type="checkbox" checked={learned} onChange={()=>toggleLearned(tip.id)}/><span>Mark as learned</span></label></article>);})}</div></div>);})}</>)}{activeTab==='videos'&&(<div className="video-grid">{VIDEO_TUTORIALS.map(vid=>(<div key={vid.id} className="video-card" style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'1rem',overflow:'hidden'}}><iframe src={`https://www.youtube.com/embed/${vid.id}`} title={vid.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{width:'100%',height:'180px',display:'block'}}/><div style={{padding:'0.85rem'}}><h4 style={{margin:0,color:t.text,fontSize:'0.88rem',fontWeight:600}}>{vid.title}</h4><span className={`difficulty-badge difficulty-${vid.level.toLowerCase()}`} style={{marginTop:'0.4rem',display:'inline-block'}}>{vid.level}</span></div></div>))}</div>)}</section>);}

// ── Profile Page ───────────────────────────────────────────────────────────
function ProfilePage({theme,userName,userPhoto,setUserPhoto,userAvatar,setUserAvatar}){const t=THEMES[theme];const fileRef=useRef();const prefs=JSON.parse(localStorage.getItem('gpa-prefs')||'{}');const gender=prefs.gender||'Others';const avatars=getAvatarsByGender(gender);useEffect(()=>{if(!userPhoto&&!userAvatar&&avatars.length>0){setUserAvatar(avatars[0]);localStorage.setItem('gpa-avatar',avatars[0]);}},[]);const handlePhotoUpload=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{setUserPhoto(ev.target.result);localStorage.setItem('gpa-photo',ev.target.result);setUserAvatar('');localStorage.removeItem('gpa-avatar');};reader.readAsDataURL(file);};const applyAvatar=emoji=>{setUserAvatar(emoji);localStorage.setItem('gpa-avatar',emoji);setUserPhoto('');localStorage.removeItem('gpa-photo');};return(<section style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}><h2 style={{margin:0,color:t.text,fontSize:'1.3rem',fontWeight:700}}>Your Profile</h2><div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'1rem',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.5rem'}}><div style={{display:'flex',alignItems:'center',gap:'1.25rem'}}><div style={{width:80,height:80,borderRadius:'999px',overflow:'hidden',border:`3px solid ${t.accent}`,display:'flex',alignItems:'center',justifyContent:'center',background:`${t.accent}22`,fontSize:'3rem',boxShadow:`0 0 20px ${t.accent}44`}}>{userPhoto?<img src={userPhoto} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span>{userAvatar||userName?.[0]?.toUpperCase()||'G'}</span>}</div><div><div style={{color:t.text,fontWeight:700,fontSize:'1.1rem'}}>{userName}</div><div style={{color:t.subtext,fontSize:'0.85rem'}}>{localStorage.getItem('gpa-email')||'Guest'}</div><div style={{color:t.subtext,fontSize:'0.8rem',marginTop:'0.2rem'}}>{prefs.role||''}{prefs.role&&prefs.level?' · ':''}{prefs.level||''}{prefs.gender?` · ${prefs.gender}`:''}</div></div></div><div><h3 style={{color:t.accent,margin:'0 0 0.75rem',fontSize:'0.85rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>Upload Your Photo</h3><input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoUpload} style={{display:'none'}}/><div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}><button onClick={()=>fileRef.current.click()} style={{background:t.btnBg,border:'none',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'0.75rem',cursor:'pointer',fontWeight:600,fontSize:'0.88rem'}}>Upload Photo</button>{(userPhoto||userAvatar)&&<button onClick={()=>{setUserPhoto('');setUserAvatar('');localStorage.removeItem('gpa-photo');localStorage.removeItem('gpa-avatar');}} style={{background:'transparent',border:`1px solid ${t.border}`,color:t.subtext,padding:'0.6rem 1rem',borderRadius:'0.75rem',cursor:'pointer',fontSize:'0.88rem'}}>Remove</button>}</div></div><div><h3 style={{color:t.accent,margin:'0 0 0.5rem',fontSize:'0.85rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>Choose Avatar ({gender})</h3><p style={{color:t.subtext,fontSize:'0.8rem',margin:'0 0 0.75rem'}}>Avatars based on your gender preference</p><div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>{avatars.map(emoji=>(<button key={emoji} onClick={()=>applyAvatar(emoji)} style={{fontSize:'2rem',padding:'0.5rem',borderRadius:'0.75rem',border:`2px solid ${userAvatar===emoji?t.accent:t.border}`,background:userAvatar===emoji?`${t.accent}22`:'transparent',cursor:'pointer',transition:'all 0.15s',boxShadow:userAvatar===emoji?`0 0 12px ${t.accent}44`:'none'}}>{emoji}</button>))}</div></div></div></section>);}

// ── FAQs ───────────────────────────────────────────────────────────────────
function FAQsPage({theme}){const t=THEMES[theme];const [openIdx,setOpenIdx]=useState(null);const faqs=[{q:'What is GitHub Profile Analyzer?',a:'GitHub Profile Analyzer is an AI-powered web app that analyzes any GitHub profile and provides insights on strengths, improvements, language usage, contribution streaks, and career tips — all powered by Groq AI.'},{q:'How does the AI analysis work?',a:'When you enter a GitHub username, we fetch your public profile data using the GitHub API. This data is then sent to our AI model which generates a structured analysis including your score, strengths, and personalized growth tips.'},{q:'Is my data stored anywhere?',a:'No. We do not store any of your personal data on any server. Your login information is stored locally in your browser using localStorage.'},{q:'How do I compare two profiles?',a:'Go to the Compare Profiles section from the sidebar. Enter two GitHub usernames and click Compare.'},{q:'What does the AI score mean?',a:'The AI score is a number from 0 to 10 that represents the overall strength of a GitHub profile based on repo activity, stars, language diversity, README quality, and contribution consistency.'},{q:'How do I improve my GitHub score?',a:'Focus on adding descriptions and READMEs to your repos, committing consistently, contributing to open source projects, and pinning your best repositories.'},{q:'Which browsers are supported?',a:'GitHub Profile Analyzer works on all modern browsers including Chrome, Firefox, Safari, Edge, and Brave.'},{q:'Is the app free to use?',a:'Yes, the app is completely free to use.'},{q:'How do I change my theme?',a:'Go to Settings from the sidebar and scroll to the Appearance section. Choose from 5 standard themes and 7 Gen-Z animated themes.'},{q:'Why does the chat assistant sometimes fail?',a:'The AI chat uses Groq API. If you see an error, make sure the backend server is running on port 8000.'}];return(<section style={{display:'flex',flexDirection:'column',gap:'1rem'}}><h2 style={{margin:0,color:t.text,fontSize:'1.3rem',fontWeight:700}}>Frequently Asked Questions</h2>{faqs.map((faq,i)=>(<div key={i} style={{background:t.cardBg,border:`1px solid ${openIdx===i?t.accent:t.border}`,borderRadius:'1rem',overflow:'hidden'}}><button onClick={()=>setOpenIdx(openIdx===i?null:i)} style={{width:'100%',padding:'1rem 1.25rem',background:'none',border:'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',color:t.text,fontWeight:600,fontSize:'0.92rem',textAlign:'left'}}><span>{faq.q}</span><span style={{color:t.accent,fontSize:'1.2rem',marginLeft:'1rem',flexShrink:0}}>{openIdx===i?'−':'+'}</span></button>{openIdx===i&&<div style={{padding:'0 1.25rem 1rem',color:t.subtext,fontSize:'0.9rem',lineHeight:1.7}}>{faq.a}</div>}</div>))}</section>);}

// ── Contact Page ───────────────────────────────────────────────────────────
function ContactPage({theme}){const t=THEMES[theme];const [name,setName]=useState('');const [email,setEmail]=useState('');const [message,setMessage]=useState('');const [sent,setSent]=useState(false);const inp={background:t.cardBg,color:t.text,borderColor:t.border};return(<section style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}><div><h2 style={{margin:0,color:t.text,fontSize:'1.3rem',fontWeight:700}}>Contact Us</h2><p style={{color:t.subtext,fontSize:'0.9rem',margin:'0.25rem 0 0'}}>We'd love to hear from you!</p></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>{[{icon:'📧',label:'Email',value:'support@gpa.dev'},{icon:'⏰',label:'Response Time',value:'Within 24 hours'},{icon:'🌍',label:'Support',value:'Available worldwide'}].map(item=>(<div key={item.label} style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'1rem',padding:'1rem',textAlign:'center'}}><div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>{item.icon}</div><div style={{color:t.subtext,fontSize:'0.78rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.25rem'}}>{item.label}</div><div style={{color:t.text,fontWeight:600,fontSize:'0.88rem'}}>{item.value}</div></div>))}</div>{sent?(<div style={{background:`${t.accent}18`,border:`1px solid ${t.accent}`,borderRadius:'1rem',padding:'2rem',textAlign:'center'}}><div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>✅</div><div style={{color:t.accent,fontWeight:700}}>Message sent!</div><button onClick={()=>{setSent(false);setName('');setEmail('');setMessage('');}} style={{background:t.btnBg,border:'none',color:'#fff',padding:'0.6rem 1.5rem',borderRadius:'0.75rem',cursor:'pointer',fontWeight:600,marginTop:'1rem',fontSize:'0.9rem'}}>Send Another</button></div>):(<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'1rem',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}><input className="auth-input" type="text" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} style={inp}/><input className="auth-input" type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/><textarea placeholder="Your message..." value={message} onChange={e=>setMessage(e.target.value)} rows={4} style={{...inp,padding:'0.85rem 1rem',borderRadius:'0.9rem',border:`1px solid ${t.border}`,fontSize:'0.95rem',outline:'none',resize:'vertical',fontFamily:'inherit'}}/><button onClick={()=>{if(name.trim()&&email.trim()&&message.trim())setSent(true);}} disabled={!name.trim()||!email.trim()||!message.trim()} style={{background:t.btnBg,border:'none',color:'#fff',padding:'0.85rem',borderRadius:'0.9rem',cursor:'pointer',fontWeight:600,fontSize:'0.95rem',opacity:(!name.trim()||!email.trim()||!message.trim())?0.6:1}}>Send Message</button></div>)}</section>);}

// ── Terms & Privacy ────────────────────────────────────────────────────────
function TermsPage({theme}){const t=THEMES[theme];const sections=[{title:'1. Acceptance of Terms',content:'By accessing or using GitHub Profile Analyzer, you agree to be bound by these Terms and Conditions.'},{title:'2. Use of Service',content:'GitHub Profile Analyzer is provided for personal and educational use only. You may not use the App for any unlawful purpose.'},{title:'3. GitHub API Usage',content:"This App uses the GitHub REST API to fetch publicly available profile data. We only access public data and never request write permissions."},{title:'4. AI-Generated Content',content:'The AI analysis is generated by Groq AI and is intended for informational purposes only. It should not be taken as professional career advice.'},{title:'5. Data Privacy',content:"We do not collect, store, or transmit your personal data to any external server. All information is stored locally in your browser's localStorage."},{title:'6. Limitation of Liability',content:'GitHub Profile Analyzer is provided as is without any warranties.'},{title:'7. Changes to Terms',content:'We reserve the right to update these Terms at any time.'},{title:'8. Contact',content:'For questions about these Terms, contact us at legal@gpa.dev'}];return(<section style={{display:'flex',flexDirection:'column',gap:'1rem'}}><div><h2 style={{margin:0,color:t.text,fontSize:'1.3rem',fontWeight:700}}>Terms & Conditions</h2><p style={{color:t.subtext,fontSize:'0.85rem',margin:'0.25rem 0 0'}}>Last updated: March 2026</p></div>{sections.map(s=>(<div key={s.title} style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'1rem',padding:'1.25rem'}}><h3 style={{color:t.accent,margin:'0 0 0.5rem',fontSize:'0.92rem',fontWeight:700}}>{s.title}</h3><p style={{color:t.subtext,fontSize:'0.88rem',lineHeight:1.7,margin:0}}>{s.content}</p></div>))}</section>);}
function PrivacyPage({theme}){const t=THEMES[theme];const sections=[{title:'What Data We Collect',content:"We collect your name and email stored locally, theme and font preferences stored locally, and onboarding preferences."},{title:'How We Use Your Data',content:'Your data is used solely to personalize your experience within the App.'},{title:'Data Storage',content:"All personal data is stored exclusively in your browser's localStorage and never transmitted to our servers."},{title:'GitHub API',content:'When you analyze a profile, we send a request to the GitHub REST API. Only publicly available data is accessed.'},{title:'AI Processing',content:"Profile data is sent to Groq AI for analysis. We do not send any personally identifiable information."},{title:'Your Rights',content:"You can delete all your data by clearing your browser's localStorage."},{title:'Contact',content:'Contact us at privacy@gpa.dev for any privacy concerns.'}];return(<section style={{display:'flex',flexDirection:'column',gap:'1rem'}}><div><h2 style={{margin:0,color:t.text,fontSize:'1.3rem',fontWeight:700}}>Privacy Policy</h2><p style={{color:t.subtext,fontSize:'0.85rem',margin:'0.25rem 0 0'}}>Last updated: March 2026</p></div>{sections.map(s=>(<div key={s.title} style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'1rem',padding:'1.25rem'}}><h3 style={{color:t.accent,margin:'0 0 0.5rem',fontSize:'0.92rem',fontWeight:700}}>{s.title}</h3><p style={{color:t.subtext,fontSize:'0.88rem',lineHeight:1.7,margin:0}}>{s.content}</p></div>))}</section>);}

// ── Settings Page ──────────────────────────────────────────────────────────
function SettingsPage({theme,setTheme,userName,userPhoto,setUserPhoto,fontSize,setFontSize,language,setLanguage,fontStyle,setFontStyle,isPremium}){
  const t=THEMES[theme];const fileRef=useRef();const [toast,setToast]=useState('');
  const handlePhotoUpload=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{setUserPhoto(ev.target.result);localStorage.setItem('gpa-photo',ev.target.result);};reader.readAsDataURL(file);};
  const animated=Object.entries(THEMES).filter(([,v])=>v.animated);
  const standard=Object.entries(THEMES).filter(([,v])=>!v.animated);
  
  const handleThemeChange=(key, isAnimated)=>{
    if(isAnimated && !isPremium) {
      setToast('Premium required for Gen-Z animated themes!');
      return;
    }
    setTheme(key);localStorage.setItem('gpa-theme',key);
  };

  return(
    <section className="settings-section">
      {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
      <h2 className="settings-title" style={{color:t.text}}>Settings</h2>
      
      <div className="settings-block" style={{background:t.cardBg,border:`1px solid ${t.border}`}}>
        <h3 className="settings-block-title" style={{color:t.accent}}>Profile Picture</h3>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <div style={{width:64,height:64,borderRadius:'999px',overflow:'hidden',border:`3px solid ${t.accent}`,display:'flex',alignItems:'center',justifyContent:'center',background:`${t.accent}22`,fontSize:'1.8rem',fontWeight:700,color:t.accent}}>{userPhoto?<img src={userPhoto} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(userName?userName[0].toUpperCase():'G')}</div>
          <div><input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoUpload} style={{display:'none'}}/><button onClick={()=>fileRef.current.click()} style={{background:t.btnBg,border:'none',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'0.75rem',cursor:'pointer',fontWeight:600,fontSize:'0.88rem'}}>Upload Photo</button>{userPhoto&&<button onClick={()=>{setUserPhoto('');localStorage.removeItem('gpa-photo');}} style={{background:'transparent',border:`1px solid ${t.border}`,color:t.subtext,padding:'0.6rem 1rem',borderRadius:'0.75rem',cursor:'pointer',fontSize:'0.88rem',marginLeft:'0.5rem'}}>Remove</button>}</div>
        </div>
      </div>
      
      <div className="settings-block" style={{background:t.cardBg,border:`1px solid ${t.border}`}}>
        <h3 className="settings-block-title" style={{color:t.accent}}>Standard Themes</h3>
        <div className="theme-grid">
          {standard.map(([key,val])=>(
            <button key={key} className={`theme-option ${theme===key?'theme-option-active':''}`} onClick={()=>handleThemeChange(key, false)} style={{background:val.containerBg,border:theme===key?`2px solid ${val.accent}`:`1px solid ${val.border}`,color:val.text,boxShadow:theme===key?`0 0 16px ${val.accent}55`:'none'}}><span className="theme-option-emoji">{val.emoji}</span><span className="theme-option-name">{val.name}</span>{theme===key&&<span className="theme-option-check">✓</span>}</button>
          ))}
        </div>
      </div>
      
      <div className="settings-block" style={{background:t.cardBg,border:`1px solid ${t.border}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,${t.accent},${t.accent2},${t.accent})`,animation:'shimmer 2s linear infinite',backgroundSize:'200% 100%'}}/>
        <h3 className="settings-block-title" style={{color:t.accent}}>✨ Gen-Z Themes {!isPremium && '(Premium Only)'}</h3>
        <div className="theme-grid">
          {animated.map(([key,val])=>(
            <button key={key} className={`theme-option ${theme===key?'theme-option-active':''}`} onClick={()=>handleThemeChange(key, true)} style={{background:val.containerBg,border:theme===key?`2px solid ${val.accent}`:`1px solid ${val.border}`,color:val.text,boxShadow:theme===key?`0 0 20px ${val.accent}77`:'none', opacity: !isPremium && theme!==key ? 0.5 : 1}}><span className="theme-option-emoji">{val.emoji}</span><span className="theme-option-name">{val.name}</span>{theme===key&&<span className="theme-option-check">✓</span>}{!isPremium && <span style={{marginLeft:'auto', fontSize:'0.8rem'}}>🔒</span>}</button>
          ))}
        </div>
      </div>
      
      <div className="settings-block" style={{background:t.cardBg,border:`1px solid ${t.border}`}}>
        <h3 className="settings-block-title" style={{color:t.accent}}>Font Size & Style</h3>
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1rem'}}>
          {FONT_SIZES.map(size=>(<button key={size} onClick={()=>{setFontSize(size);localStorage.setItem('gpa-fontsize',size);document.documentElement.style.fontSize=FONT_SIZE_MAP[size];}} style={{padding:'0.5rem 1rem',borderRadius:'0.75rem',border:`1px solid ${fontSize===size?t.accent:t.border}`,background:fontSize===size?`${t.accent}18`:'transparent',color:fontSize===size?t.accent:t.text,cursor:'pointer',fontWeight:fontSize===size?700:400,fontSize:'0.88rem'}}>{size}</button>))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {FONT_STYLES.map(f=>(<button key={f.name} onClick={()=>{setFontStyle(f.value);localStorage.setItem('gpa-fontfamily',f.value);document.body.style.fontFamily=f.value;}} style={{padding:'0.6rem 1rem',borderRadius:'0.75rem',border:`1px solid ${fontStyle===f.value?t.accent:t.border}`,background:fontStyle===f.value?`${t.accent}18`:'transparent',color:fontStyle===f.value?t.accent:t.text,cursor:'pointer',fontWeight:fontStyle===f.value?700:400,fontSize:'0.9rem',fontFamily:f.value,textAlign:'left'}}>{f.name} — <span style={{opacity:0.7}}>The quick fox jumps over the lazy dog</span></button>))}
        </div>
      </div>
      
      <div className="settings-block" style={{background:t.cardBg,border:`1px solid ${t.border}`}}>
        <h3 className="settings-block-title" style={{color:t.accent}}>Language Preference</h3>
        <select value={language} onChange={e=>{setLanguage(e.target.value);localStorage.setItem('gpa-language',e.target.value);setToast(`Language set to ${e.target.value}. Translations updated.`);}} style={{background:t.cardBg,color:t.text,border:`1px solid ${t.border}`,borderRadius:'0.75rem',padding:'0.6rem 1rem',fontSize:'0.9rem',outline:'none',cursor:'pointer',width:'100%',maxWidth:'280px'}}>
          {LANGUAGES.map(lang=><option key={lang} value={lang}>{lang}</option>)}
        </select>
      </div>
      
      <div className="settings-block" style={{background:t.cardBg,border:`1px solid ${t.border}`}}>
        <h3 className="settings-block-title" style={{color:t.accent}}>Account</h3>
        <p style={{color:t.subtext,fontSize:'0.9rem',margin:0}}>Logged in as <strong style={{color:t.text}}>{userName}</strong></p>
        <p style={{color:t.subtext,fontSize:'0.82rem',margin:'0.25rem 0 0'}}>{localStorage.getItem('gpa-email')||''}</p>
        <p style={{color:t.accent,fontSize:'0.82rem',margin:'0.25rem 0 0',fontWeight:'bold'}}>{isPremium ? 'Premium Tier ✨' : 'Free Tier'}</p>
      </div>
    </section>
  );
}

// ── Profile Dropdown ───────────────────────────────────────────────────────
function ProfileDropdown({t,userName,userPhoto,userAvatar,onViewProfile,onSettings,onLogout,onClose}){const ref=useRef();useEffect(()=>{const handler=e=>{if(ref.current&&!ref.current.contains(e.target))onClose();};document.addEventListener('mousedown',handler);return()=>document.removeEventListener('mousedown',handler);},[onClose]);return(<div ref={ref} style={{position:'absolute',top:'3rem',right:0,background:t.containerBg,border:`1px solid ${t.border}`,borderRadius:'1rem',padding:'0.5rem',minWidth:'200px',boxShadow:'0 16px 48px rgba(0,0,0,0.4)',zIndex:200}}><div style={{padding:'0.75rem 1rem',borderBottom:`1px solid ${t.border}`,marginBottom:'0.25rem'}}><div style={{color:t.text,fontWeight:600,fontSize:'0.9rem'}}>{userName}</div><div style={{color:t.subtext,fontSize:'0.78rem'}}>{localStorage.getItem('gpa-email')||'Guest'}</div></div>{[{label:'Your Profile',icon:'👤',action:onViewProfile},{label:'Settings',icon:'⚙️',action:onSettings},{label:'Logout',icon:'🚪',action:onLogout,danger:true}].map(item=>(<button key={item.label} onClick={()=>{item.action();onClose();}} style={{display:'flex',alignItems:'center',gap:'0.6rem',width:'100%',padding:'0.65rem 1rem',background:'none',border:'none',cursor:'pointer',borderRadius:'0.6rem',color:item.danger?'#f87171':t.text,fontSize:'0.9rem',textAlign:'left'}}><span>{item.icon}</span>{item.label}</button>))}</div>);}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({isOpen, onClose, view, setView, onLogout, userName, userPhoto, userAvatar, theme, language, isPremium}) {
  const tTheme = THEMES[theme];
  const navItems = [
    {key: 'dashboard', label: tStr(language, 'dashboard')},
    {key: 'compare', label: tStr(language, 'compare')},
    {key: 'tutorial', label: tStr(language, 'tutorial')},
    {key: 'profile', label: tStr(language, 'profile')},
    {key: 'subscription', label: tStr(language, 'subscription') + ' ' + (isPremium ? '✨' : '')},
    {key: 'settings', label: tStr(language, 'settings')},
    {key: 'faqs', label: tStr(language, 'faqs')},
    {key: 'contact', label: tStr(language, 'contact')},
    {key: 'terms', label: tStr(language, 'terms')},
    {key: 'privacy', label: tStr(language, 'privacy')}
  ];
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}/>}
      <aside className="sidebar" style={{transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', background: tTheme.sidebarBg, borderRight: `1px solid ${tTheme.border}`}}>
        <div className="sidebar-header"><div className="sidebar-logo"><AnimatedGitHubLogo size={24} color={tTheme.accent}/><span style={{color: tTheme.text, fontWeight: 700, fontSize: '1rem', marginLeft: '0.5rem'}}>GPA</span></div><button className="sidebar-close" onClick={onClose} style={{color: tTheme.subtext}}>✕</button></div>
        <div className="sidebar-user" style={{borderBottom: `1px solid ${tTheme.border}`}}>
          <UserAvatar name={userName} photo={userPhoto} avatarEmoji={userAvatar} size={40} accent={tTheme.accent}/>
          <div><div style={{color: tTheme.text, fontWeight: 600, fontSize: '0.9rem'}}>{userName || 'Guest'}</div><div style={{color: tTheme.accent, fontSize: '0.78rem', fontWeight: 700}}>{isPremium ? 'Premium Member' : 'Free Tier'}</div></div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.key} className={`sidebar-nav-item ${view === item.key ? 'sidebar-nav-active' : ''}`} onClick={() => {setView(item.key); onClose();}} style={{color: view === item.key ? tTheme.accent : tTheme.text, background: view === item.key ? `${tTheme.accent}18` : 'transparent', borderLeft: view === item.key ? `3px solid ${tTheme.accent}` : '3px solid transparent'}}>{item.label}</button>
          ))}
        </nav>
        <div className="sidebar-footer" style={{borderTop: `1px solid ${tTheme.border}`}}>
          <button className="sidebar-logout" onClick={onLogout} style={{color: '#f87171', borderColor: 'rgba(248,113,113,0.3)'}}>Logout</button>
        </div>
      </aside>
    </>
  );
}

// ── Improved Chat Widget ───────────────────────────────────────────────────
function ChatWidget({ t, chatMessages, chatInput, setChatInput, handleSendMessage, isChatOpen, setIsChatOpen }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatBodyRef = useRef();

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatMessages]);

  const windowWidth = isMaximized ? 520 : 340;
  const windowHeight = isMaximized ? 520 : 400;

  return (
    <>
      {/* FAB Button */}
      <button type="button" onClick={() => { setIsChatOpen(p => !p); setIsMinimized(false); }}
        style={{ position:'fixed', right:'1.75rem', bottom:'1.75rem', width:'3.5rem', height:'3.5rem', borderRadius:'999px', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px', zIndex:20, background:t.btnBg, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', transition:'transform 0.15s ease' }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px) scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
        <AnimatedGitHubLogo size={20} color="#fff"/>
        {!isChatOpen && <span style={{ fontSize:'0.42rem', color:'rgba(255,255,255,0.9)', fontWeight:700, letterSpacing:'0.02em', whiteSpace:'nowrap' }}>Need help?</span>}
      </button>

      {/* Chat Window */}
      {isChatOpen && !isMinimized && (
        <div style={{ position:'fixed', right:'1.75rem', bottom:'5.5rem', width:windowWidth, height:windowHeight, background:t.containerBg, border:`1px solid ${t.border}`, borderRadius:'1.25rem', boxShadow:'0 24px 60px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', zIndex:30, transition:'all 0.2s ease', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1rem', borderBottom:`1px solid ${t.border}`, background:`${t.accent}11`, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <AnimatedGitHubLogo size={18} color={t.accent}/>
              <span style={{ color:t.accent, fontWeight:700, fontSize:'0.88rem' }}>GitHub Growth Assistant</span>
              <span style={{ width:'7px', height:'7px', borderRadius:'999px', background:'#4ade80', animation:'pulse 2s ease-in-out infinite' }}/>
            </div>
            <div style={{ display:'flex', gap:'0.35rem' }}>
              {/* Minimize */}
              <button onClick={() => setIsMinimized(true)} title="Minimize"
                style={{ width:'1.4rem', height:'1.4rem', borderRadius:'999px', border:'none', background:'#fbbf24', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:'#000' }}>—</button>
              {/* Maximize/Restore */}
              <button onClick={() => setIsMaximized(p => !p)} title={isMaximized ? 'Restore' : 'Maximize'}
                style={{ width:'1.4rem', height:'1.4rem', borderRadius:'999px', border:'none', background:'#4ade80', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:'#000' }}>{isMaximized ? '⤡' : '⤢'}</button>
              {/* Close */}
              <button onClick={() => setIsChatOpen(false)} title="Close"
                style={{ width:'1.4rem', height:'1.4rem', borderRadius:'999px', border:'none', background:'#f87171', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:'#000' }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatBodyRef} style={{ flex:1, overflowY:'auto', padding:'0.85rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{ display:'flex', justifyContent:msg.from==='user'?'flex-end':'flex-start' }}>
                {msg.from==='bot' && (
                  <div style={{ width:'1.6rem', height:'1.6rem', borderRadius:'999px', background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:'0.4rem', alignSelf:'flex-end' }}>
                    <AnimatedGitHubLogo size={10} color="#000"/>
                  </div>
                )}
                <div style={{ maxWidth:'80%', padding:'0.55rem 0.85rem', borderRadius: msg.from==='user'?'1rem 1rem 0.2rem 1rem':'1rem 1rem 1rem 0.2rem', background: msg.from==='user'?t.btnBg:`${t.cardBg}`, border: msg.from==='bot'?`1px solid ${t.border}`:'none', color: msg.from==='user'?'#fff':t.text, fontSize:'0.85rem', lineHeight:1.5 }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'0.6rem 0.75rem', borderTop:`1px solid ${t.border}`, display:'flex', gap:'0.5rem', flexShrink:0 }}>
            <input type="text" placeholder="Ask about growing your GitHub..." value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); handleSendMessage(); } }}
              style={{ flex:1, padding:'0.5rem 0.75rem', borderRadius:'0.75rem', border:`1px solid ${t.border}`, background:t.cardBg, color:t.text, fontSize:'0.85rem', outline:'none' }}/>
            <button onClick={handleSendMessage}
              style={{ padding:'0.5rem 0.9rem', borderRadius:'0.75rem', border:'none', background:t.btnBg, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.82rem' }}>Send</button>
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {isChatOpen && isMinimized && (
        <div onClick={() => setIsMinimized(false)}
          style={{ position:'fixed', right:'1.75rem', bottom:'5.5rem', background:t.containerBg, border:`1px solid ${t.border}`, borderRadius:'0.75rem', padding:'0.5rem 1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', zIndex:30 }}>
          <AnimatedGitHubLogo size={16} color={t.accent}/>
          <span style={{ color:t.accent, fontSize:'0.82rem', fontWeight:600 }}>GitHub Growth Assistant</span>
          <span style={{ color:t.subtext, fontSize:'0.75rem' }}>Click to open</span>
        </div>
      )}
    </>
  );
}

// ── Subscription Page ────────────────────────────────────────────────────────
function SubscriptionPage({theme, isPremium, setIsPremium, setView}) {
  const tTheme = THEMES[theme];
  const [selectedPlan, setSelectedPlan] = useState('1 Month');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    { name: '1 Week', price: '$3', features: ['Unlimited Analyzer', 'Unlimited Comparison', 'Gen-Z Themes'] },
    { name: '1 Month', price: '$7', features: ['Unlimited Analyzer', 'Unlimited Comparison', 'Gen-Z Themes'] },
    { name: '3 Months', price: '$15', features: ['Unlimited Analyzer', 'Unlimited Comparison', 'Gen-Z Themes'] },
    { name: '1 Year', price: '$30', features: ['Unlimited Analyzer', 'Unlimited Comparison', 'Gen-Z Themes'] },
  ];
  const methods = ['Razorpay', 'PhonePe', 'PayPal', 'Google Pay', 'Paytm'];

  const handleCheckout = () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPremium(true);
      localStorage.setItem('gpa-premium', 'true');
      alert('Payment Successful! Welcome to Premium.');
      setView('dashboard');
    }, 1500);
  };

  if (isPremium) {
    return (
      <section style={{textAlign: 'center', paddingTop: '4rem'}}>
        <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎉</div>
        <h2 style={{color: tTheme.accent, fontSize: '2rem'}}>You are Premium!</h2>
        <p style={{color: tTheme.subtext}}>Enjoy unlimited analysis, comparisons, and Gen-Z themes.</p>
      </section>
    );
  }

  return (
    <section style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto'}}>
      <div style={{textAlign: 'center'}}>
        <h2 style={{margin: 0, color: tTheme.text, fontSize: '1.6rem', fontWeight: 800}}>Upgrade to Premium</h2>
        <p style={{color: tTheme.subtext, fontSize: '0.95rem', margin: '0.5rem 0 1.5rem'}}>Unlock infinite profile analysis, infinite comparisons, and Gen-Z animated themes!</p>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
        {plans.map(p => (
          <div key={p.name} onClick={() => setSelectedPlan(p.name)} style={{background: tTheme.cardBg, border: `2px solid ${selectedPlan === p.name ? tTheme.accent : tTheme.border}`, borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s'}}>
            <h4 style={{color: tTheme.text, margin: '0 0 0.5rem', fontSize: '1.1rem'}}>{p.name}</h4>
            <div style={{color: tTheme.accent, fontWeight: 800, fontSize: '1.5rem', marginBottom: '1rem'}}>{p.price}</div>
            {p.features.map((f, i) => (
              <div key={i} style={{color: tTheme.subtext, fontSize: '0.85rem', marginBottom: '0.2rem'}}>✓ {f}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{background: tTheme.cardBg, border: `1px solid ${tTheme.border}`, borderRadius: '1rem', padding: '1.5rem'}}>
        <h3 style={{color: tTheme.accent, margin: '0 0 1rem', fontSize: '1rem'}}>Select Payment Method</h3>
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
          {methods.map(m => (
            <button key={m} onClick={() => setSelectedMethod(m)} style={{padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: `1px solid ${selectedMethod === m ? tTheme.accent : tTheme.border}`, background: selectedMethod === m ? `${tTheme.accent}22` : 'transparent', color: selectedMethod === m ? tTheme.accent : tTheme.text, cursor: 'pointer', fontWeight: 600}}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={handleCheckout} disabled={isProcessing} style={{width: '100%', marginTop: '1.5rem', padding: '1rem', background: tTheme.btnBg, color: '#fff', border: 'none', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer'}}>
          {isProcessing ? 'Processing...' : `Pay ${plans.find(p=>p.name===selectedPlan).price} securely`}
        </button>
      </div>
    </section>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
function App(){
  const savedTheme=localStorage.getItem('gpa-theme')||'dark';
  const savedUser=localStorage.getItem('gpa-username');
  const savedPhoto=localStorage.getItem('gpa-photo')||'';
  const savedAvatar=localStorage.getItem('gpa-avatar')||'';
  const savedFontSize=localStorage.getItem('gpa-fontsize')||'Medium';
  const savedLanguage=localStorage.getItem('gpa-language')||'English';
  const savedFontStyle=localStorage.getItem('gpa-fontfamily')||'system-ui, sans-serif';
  const savedPremium=localStorage.getItem('gpa-premium')==='true';
  const savedAnalyzeCount=parseInt(localStorage.getItem('gpa-analyze-count')||'0',10);
  const savedCompareCount=parseInt(localStorage.getItem('gpa-compare-count')||'0',10);

  const [theme,setTheme]=useState(savedTheme);
  const [authStep,setAuthStep]=useState(savedUser?'app':'auth');
  const [userName,setUserName]=useState(savedUser||'');
  const [userPhoto,setUserPhoto]=useState(savedPhoto);
  const [userAvatar,setUserAvatar]=useState(savedAvatar);
  const [fontSize,setFontSize]=useState(savedFontSize);
  const [language,setLanguage]=useState(savedLanguage);
  const [fontStyle,setFontStyle]=useState(savedFontStyle);
  const [isPremium,setIsPremium]=useState(savedPremium);
  const [analyzeCount,setAnalyzeCount]=useState(savedAnalyzeCount);
  const [compareCount,setCompareCount]=useState(savedCompareCount);

  const [isSidebarOpen,setIsSidebarOpen]=useState(false);
  const [view,setView]=useState('dashboard');
  const [searchQuery,setSearchQuery]=useState('');
  const [username,setUsername]=useState('');
  const [isLoading,setIsLoading]=useState(false);
  const [error,setError]=useState('');
  const [profile,setProfile]=useState(null);
  const [topLanguages,setTopLanguages]=useState([]);
  const [topRepos,setTopRepos]=useState([]);
  const [aiAnalysis,setAiAnalysis]=useState(null);
  const [streakStats,setStreakStats]=useState(null);
  const [isChatOpen,setIsChatOpen]=useState(false);
  const [chatInput,setChatInput]=useState('');
  const [chatMessages,setChatMessages]=useState(INITIAL_CHAT);
  const [showProfileDropdown,setShowProfileDropdown]=useState(false);
  const [toast,setToast]=useState('');

  const t=THEMES[theme];

  useEffect(()=>{localStorage.setItem('gpa-theme',theme);},[theme]);
  useEffect(()=>{document.documentElement.style.fontSize=FONT_SIZE_MAP[fontSize];},[fontSize]);
  useEffect(()=>{document.body.style.fontFamily=fontStyle;},[fontStyle]);

  const clearAnalysisData=()=>{setProfile(null);setTopLanguages([]);setTopRepos([]);setAiAnalysis(null);setStreakStats(null);setUsername('');setError('');setChatMessages(INITIAL_CHAT);setIsChatOpen(false);};

  const handleLogin=(name,email,isNewUser)=>{
    setUserName(name);localStorage.setItem('gpa-username',name);
    if(email)localStorage.setItem('gpa-email',email);
    clearAnalysisData();setView('dashboard');
    if(isNewUser){localStorage.removeItem('gpa-onboarded');setAuthStep('onboarding');}
    else{setAuthStep('app');}
  };
  const handleOnboardingComplete=(prefs)=>{localStorage.setItem('gpa-onboarded','true');localStorage.setItem('gpa-prefs',JSON.stringify(prefs));setAuthStep('app');};
  const handleLogout=()=>{setAuthStep('auth');setUserName('');setUserPhoto('');setUserAvatar('');setIsSidebarOpen(false);setView('dashboard');clearAnalysisData();};

  const handleAnalyze=async(overrideUser)=>{
    const trimmed=(overrideUser||username).trim();
    if(!trimmed){setError('Please enter a GitHub username.');return;}

    // Check limits
    if (!isPremium && analyzeCount >= 3) {
      setError('Free limit reached! You have used your 3 free profile analyses.');
      setTimeout(() => setView('subscription'), 2000);
      return;
    }

    setIsLoading(true);setError('');
    try{
      const response=await axios.get(`http://127.0.0.1:8000/analyze/${encodeURIComponent(trimmed)}`);
      const data=response.data||{};
      setProfile(data.analysis?.profile||data.profile||null);
      setTopLanguages(data.analysis?.top_languages||data.top_languages||[]);
      setTopRepos((data.analysis?.top_repositories||data.top_repositories||[]).slice(0,3));
      setAiAnalysis(data.analysis?.ai_analysis||data.ai_analysis||null);
      setStreakStats(data.analysis?.contribution_streak||data.contribution_streak||null);

      if(!isPremium) {
        setAnalyzeCount(prev => {
          const newCnt = prev + 1;
          localStorage.setItem('gpa-analyze-count', newCnt);
          return newCnt;
        });
      }
    }catch{setError('Failed to analyze. Make sure backend is running and username is valid.');}
    finally{setIsLoading(false);}
  };

  const handleSendMessage=async()=>{
    const trimmed=chatInput.trim();if(!trimmed)return;
    const prev=chatMessages;
    const userMsg={id:Date.now(),from:'user',text:trimmed};
    const thinkId=Date.now()+1;
    setChatMessages(m=>[...m,userMsg,{id:thinkId,from:'bot',text:'Thinking...'}]);setChatInput('');
    try{
      const res=await axios.post('http://127.0.0.1:8000/chat',{message:trimmed,history:[...prev,userMsg].map(m=>({role:m.from==='user'?'user':'assistant',content:m.text}))});
      setChatMessages(m=>m.map(msg=>msg.id===thinkId?{...msg,text:res.data?.reply||'Analyzing...'}:msg));
    }catch{setChatMessages(m=>m.map(msg=>msg.id===thinkId?{...msg,text:'Sorry, could not reach the assistant. Make sure backend is running.'}:msg));}
  };

  if(authStep==='auth')return<AuthPage onLogin={handleLogin} theme={theme}/>;
  if(authStep==='onboarding')return<OnboardingSlides userName={userName} onComplete={handleOnboardingComplete} theme={theme}/>;

  return(
    <div className="App" style={{background:`radial-gradient(circle at 20% 20%,${t.accent}15,transparent 50%),radial-gradient(circle at 80% 80%,${t.accent2}15,transparent 50%),${t.bg}`,color:t.text,minHeight:'100vh'}}>
      {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
      <Sidebar isOpen={isSidebarOpen} onClose={()=>setIsSidebarOpen(false)} view={view} setView={setView} onLogout={handleLogout} userName={userName} userPhoto={userPhoto} userAvatar={userAvatar} theme={theme} language={language} isPremium={isPremium}/>
      <div className="top-search-bar" style={{background:t.containerBg,borderBottom:`1px solid ${t.border}`,backdropFilter:'blur(12px)'}}>
        <button className="hamburger-btn" onClick={()=>setIsSidebarOpen(true)} style={{color:t.text}}>☰</button>
        <AnimatedGitHubLogo size={22} color={t.accent}/>
        <input className="top-search-input" type="text" placeholder={tStr(language, 'searchPlaceholder')||"Search any GitHub username..."} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&searchQuery.trim()){setUsername(searchQuery.trim());setView('dashboard');handleAnalyze(searchQuery.trim());setSearchQuery('');}}} style={{background:t.cardBg,color:t.text,borderColor:t.border}}/>
        <div style={{position:'relative',flexShrink:0,marginLeft:'auto'}}>
          <UserAvatar name={userName} photo={userPhoto} avatarEmoji={userAvatar} size={34} accent={t.accent} onClick={()=>setShowProfileDropdown(p=>!p)}/>
          {showProfileDropdown&&<ProfileDropdown t={t} userName={userName} userPhoto={userPhoto} userAvatar={userAvatar} onViewProfile={()=>{setView('profile');setShowProfileDropdown(false);}} onSettings={()=>{setView('settings');setShowProfileDropdown(false);}} onLogout={handleLogout} onClose={()=>setShowProfileDropdown(false)}/>}
        </div>
      </div>
      <div className="app-container" style={{background:'transparent',border:'none',boxShadow:'none',paddingTop:'1rem'}}>
        <main className="app-main">
          {view==='dashboard'&&(<>
            <div className="hero-section">
              <div className="hero-logo-wrap" style={{boxShadow:`0 0 40px ${t.accent}44`}}><AnimatedGitHubLogo size={60} color={t.accent}/></div>
              <h1 className="hero-title" style={{color:t.text}}>GitHub Profile Analyzer</h1>
              <p className="hero-subtitle" style={{color:t.subtext}}>Enter any GitHub username to get AI-powered insights</p>
              <div className="search-input-row hero-search">
                <input id="github-username" className="search-input" type="text" placeholder="" value={username} onChange={e=>{setUsername(e.target.value);if(!e.target.value.trim())clearAnalysisData();}} onKeyDown={e=>e.key==='Enter'&&handleAnalyze()} style={{background:t.cardBg,color:t.text,borderColor:t.border}}/>
                <button className="search-button" type="button" onClick={()=>handleAnalyze()} disabled={isLoading} style={{background:t.btnBg}}>{isLoading?'Analyzing...':'Analyze'}</button>
              </div>
            </div>
            {error&&<p style={{color:'#f87171',textAlign:'center'}}>{error}</p>}
            {isLoading&&<LoadingSpinner/>}
            {!isLoading&&(profile||aiAnalysis)&&(
              <section className="results-section">
                <h2 className="results-title" style={{color:t.subtext}}>Analysis Results</h2>
                <div className="results-grid">
                  <ProfileCard profile={profile}/>
                  <ContributionStreakCard streak={streakStats}/>
                  <TopLanguagesCard languages={topLanguages}/>
                  <RepositoryHighlightsCard repos={topRepos}/>
                  <AiAnalysisCard analysis={aiAnalysis} error={null}/>
                </div>
                {/* Profile Reality Check below results */}
                <ProfileRealityCheck
                  profile={profile}
                  languages={topLanguages}
                  repos={topRepos}
                  streak={streakStats}
                  aiAnalysis={aiAnalysis}
                  t={t}
                />
              </section>
            )}
          </>)}
          {view==='compare'&&<CompareSection theme={theme} language={language} isPremium={isPremium} compareCount={compareCount} setCompareCount={setCompareCount} setView={setView}/>}
          {view==='subscription'&&<SubscriptionPage theme={theme} isPremium={isPremium} setIsPremium={setIsPremium} setView={setView}/>}
          {view==='tutorial'&&<TutorialSection theme={theme}/>}
          {view==='settings'&&<SettingsPage theme={theme} setTheme={setTheme} userName={userName} userPhoto={userPhoto} setUserPhoto={setUserPhoto} fontSize={fontSize} setFontSize={setFontSize} language={language} setLanguage={setLanguage} fontStyle={fontStyle} setFontStyle={setFontStyle} isPremium={isPremium}/>}
          {view==='profile'&&<ProfilePage theme={theme} userName={userName} userPhoto={userPhoto} setUserPhoto={setUserPhoto} userAvatar={userAvatar} setUserAvatar={setUserAvatar}/>}
          {view==='faqs'&&<FAQsPage theme={theme}/>}
          {view==='contact'&&<ContactPage theme={theme}/>}
          {view==='terms'&&<TermsPage theme={theme}/>}
          {view==='privacy'&&<PrivacyPage theme={theme}/>}
        </main>
      </div>

      {/* Improved Chat Widget - Dashboard only */}
      {view==='dashboard'&&(
        <ChatWidget
          t={t}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendMessage={handleSendMessage}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
        />
      )}
    </div>
  );
}

export default App;