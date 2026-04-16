import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

interface IrrelevantStatsProps {
  inputText: string;
}

const COLORS = ['#a78bfa', '#34d399', '#fb923c', '#f472b6', '#60a5fa', '#facc15'];

function seededRand(seed: string, index: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.abs((Math.imul(h, index + 1) ^ (h >> 5)) % 100) + 1;
}

export function IrrelevantStats({ inputText }: IrrelevantStatsProps) {
  const seed = inputText.trim() || 'standard';

  const barData = useMemo(() => [
    { name: 'Mandager', verdi: seededRand(seed, 1) },
    { name: 'Kaffe', verdi: seededRand(seed, 2) },
    { name: 'Prokrast.', verdi: seededRand(seed, 3) },
    { name: 'Netter', verdi: seededRand(seed, 4) },
    { name: 'Møter', verdi: seededRand(seed, 5) },
  ], [seed]);

  const pieData = useMemo(() => [
    { name: 'Faktisk jobbing', value: seededRand(seed, 6) },
    { name: 'Se ut som man jobber', value: seededRand(seed, 7) },
    { name: 'Kaffe-pauser', value: seededRand(seed, 8) },
    { name: 'Tenke på lunsj', value: seededRand(seed, 9) },
  ], [seed]);

  const radarData = useMemo(() => [
    { subject: 'Motivasjon', A: seededRand(seed, 10) },
    { subject: 'Energi', A: seededRand(seed, 11) },
    { subject: 'Kaos', A: seededRand(seed, 12) },
    { subject: 'Vibes', A: seededRand(seed, 13) },
    { subject: 'YOLO', A: seededRand(seed, 14) },
    { subject: 'Snacks', A: seededRand(seed, 15) },
  ], [seed]);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginTop: '1.5rem',
      border: '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(4px)',
    }}>
      <h3 style={{
        color: 'rgba(255,255,255,0.9)',
        margin: '0 0 0.25rem 0',
        fontSize: '1.1rem',
        textAlign: 'center',
      }}>
        📊 Fullstendig Irrelevant Statistikk™
      </h3>
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.75rem',
        textAlign: 'center',
        margin: '0 0 1.5rem 0',
        fontStyle: 'italic',
      }}>
        Basert på avanserte algoritmer vi ikke forstår selv
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Bar chart */}
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 0.5rem 0' }}>
            Korrelasjonsindeks (enhet: ukjent)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '8px', color: 'white' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="verdi" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 0.5rem 0' }}>
            Fordeling av en arbeidsdag
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.75rem' }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 0.5rem 0' }}>
            Din situasjon nå (estimert av en ku)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Radar dataKey="A" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.35} />
              <Tooltip
                contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '8px', color: 'white' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <p style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.65rem',
        textAlign: 'right',
        margin: '0.75rem 0 0 0',
        fontStyle: 'italic',
      }}>
        * Tall oppdateres i sanntid basert på kosmiske vibrasjoner
      </p>
    </div>
  );
}
